import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { event, data } = body;
    const task = data;

    if (!task.project_id) {
      return Response.json({ error: 'No project_id' }, { status: 400 });
    }

    // Get the task's project to find user email
    let userEmail = null;
    try {
      const project = await base44.asServiceRole.entities.Project.get(task.project_id);
      // Try to get client email
      if (project.client_id) {
        const client = await base44.asServiceRole.entities.Client.get(project.client_id);
        userEmail = client.email;
      }
    } catch (e) {
      console.log("Could not fetch project/client info");
    }

    // Get Slack config for this user (or default)
    const configs = await base44.asServiceRole.entities.SlackIntegration.filter(
      { is_active: true },
      "-last_configured",
      1
    );
    
    if (!configs || configs.length === 0) {
      return Response.json({ error: 'No active Slack config' }, { status: 400 });
    }

    const config = configs[0];

    // Call postSlackUpdate
    const res = await base44.asServiceRole.functions.invoke("postSlackUpdate", {
      event: task.status,
      channel_id: config.channel_id,
      task_data: task,
    });

    return Response.json({ success: true, slack_ts: res.data?.ts });
  } catch (error) {
    console.error("Error in sendTaskUpdateToSlack:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});