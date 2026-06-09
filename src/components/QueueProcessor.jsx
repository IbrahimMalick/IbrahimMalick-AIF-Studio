import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Queue Processor Component
 * 
 * This headless component runs queue processing logic.
 * It can be included in admin pages or run as a background service.
 * 
 * To enable: Add this component to your admin dashboard or layout.
 * To disable: Remove the component or set enabled={false}
 */

export default function QueueProcessor({ enabled = true, interval = 30000 }) {
  const [processing, setProcessing] = useState(false);
  const [lastRun, setLastRun] = useState(null);

  const processQueueItem = async (queueItem) => {
    try {
      // Update status to processing
      await base44.entities.ProductionQueue.update(queueItem.id, {
        status: 'processing',
        started_at: new Date().toISOString()
      });

      // Get related project and client data
      const projects = await base44.entities.Project.filter({ id: queueItem.project_id });
      const project = projects[0];

      if (!project) {
        throw new Error('Project not found');
      }

      const clients = await base44.entities.Client.filter({ id: project.client_id });
      const client = clients[0];

      // Determine routing based on task
      const routing = {
        agentRole: queueItem.assigned_to.toUpperCase(),
        taskKind: mapTaskType(queueItem.task_type),
        importance: client?.tier === 'enterprise' ? 'high' : 'normal'
      };

      // Build messages for LLM
      const messages = buildMessages(queueItem, project, client);

      // Call Cloudflare Worker (if URL is configured)
      const workerUrl = window.CLOUDFLARE_WORKER_URL;
      
      if (!workerUrl) {
        console.warn('CLOUDFLARE_WORKER_URL not configured. Simulating success.');
        // Simulate successful processing
        await base44.entities.ProductionQueue.update(queueItem.id, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          output_data: { simulated: true, message: 'Worker URL not configured' }
        });
        return;
      }

      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...routing,
          messages
        })
      });

      if (!response.ok) {
        throw new Error(`Worker returned ${response.status}`);
      }

      const result = await response.json();

      // Update queue item with results
      await base44.entities.ProductionQueue.update(queueItem.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        output_data: result.content || result,
        llm_provider: result.provider,
        llm_model: result.model,
        tokens_used: result.usage?.total_tokens || 0
      });

      // Update project with appropriate output
      const outputField = `${queueItem.assigned_to}_output`;
      await base44.entities.Project.update(project.id, {
        [outputField]: result.content || result
      });

      // Create next queue item if workflow continues
      await createNextTask(queueItem, project, result);

      return { success: true, queueItemId: queueItem.id };

    } catch (error) {
      console.error('Queue processing error:', error);
      
      // Update queue item with error
      await base44.entities.ProductionQueue.update(queueItem.id, {
        status: queueItem.retry_count >= 3 ? 'failed' : 'pending',
        error_message: error.message,
        retry_count: (queueItem.retry_count || 0) + 1
      });

      return { success: false, error: error.message };
    }
  };

  const processQueue = async () => {
    if (processing) return;

    setProcessing(true);
    
    try {
      // Get pending queue items (up to 5 at a time)
      const pending = await base44.entities.ProductionQueue.filter({
        status: 'pending'
      });

      // Sort by priority (lower number = higher priority)
      const sorted = pending.sort((a, b) => (a.priority || 5) - (b.priority || 5));
      const batch = sorted.slice(0, 5);

      if (batch.length === 0) {
        setLastRun(new Date());
        setProcessing(false);
        return;
      }

      // Process each item
      const results = await Promise.all(
        batch.map(item => processQueueItem(item))
      );

      const successful = results.filter(r => r.success).length;
      console.log(`Processed ${successful}/${batch.length} queue items`);

      setLastRun(new Date());
    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Run immediately on mount
    processQueue();

    // Set up interval
    const timer = setInterval(processQueue, interval);

    return () => clearInterval(timer);
  }, [enabled, interval]);

  // This is a headless component - no UI
  return null;
}

// Helper functions
function mapTaskType(taskType) {
  const mapping = {
    discovery: 'strategy',
    script: 'creative_copy',
    video: 'creative_copy',
    revision: 'creative_copy',
    export: 'system_design'
  };
  return mapping[taskType] || 'creative_copy';
}

function buildMessages(queueItem, project, client) {
  const systemPrompt = getSystemPrompt(queueItem.assigned_to, queueItem.task_type);
  
  const userMessage = `
Client: ${client?.company_name || 'Unknown'}
Tier: ${client?.tier || 'foundation'}
Project: ${project?.project_name || 'Untitled'}
Campaign Type: ${project?.campaign_type || 'foundation'}

${queueItem.input_data?.requirements || queueItem.input_data?.feedback || 'Please proceed with standard workflow.'}
  `.trim();

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];
}

function getSystemPrompt(assignedTo, taskType) {
  const prompts = {
    vp: 'You are the VP of Operations for AI Freedom Studios. Provide strategic direction for this campaign.',
    manager: 'You are the Campaign Manager for AI Freedom Studios. Create detailed tactical plans for execution.',
    engineer: 'You are the Creative Engineer for AI Freedom Studios. Generate compelling ad scripts and creative direction.'
  };
  return prompts[assignedTo] || prompts.engineer;
}

async function createNextTask(currentTask, project, result) {
  // Workflow progression logic
  const nextTaskMap = {
    discovery: { assigned_to: 'manager', task_type: 'script' },
    script: { assigned_to: 'engineer', task_type: 'video' },
    video: null, // End of workflow
    revision: { assigned_to: 'engineer', task_type: 'video' }
  };

  const nextTask = nextTaskMap[currentTask.task_type];
  
  if (!nextTask) return;

  // Create next queue item
  await base44.entities.ProductionQueue.create({
    project_id: project.id,
    task_type: nextTask.task_type,
    assigned_to: nextTask.assigned_to,
    input_data: {
      previous_output: result
    },
    status: 'pending',
    priority: currentTask.priority,
    queued_at: new Date().toISOString()
  });
}