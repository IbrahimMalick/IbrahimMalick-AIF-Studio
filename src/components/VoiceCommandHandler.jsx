import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function VoiceCommandHandler() {
  const handledRef = useRef(new Set());

  useEffect(() => {
    const handleCreateTask = async (e) => {
      const { content } = e.detail;
      const eventId = `task-${Date.now()}`;
      
      if (handledRef.current.has(eventId)) return;
      handledRef.current.add(eventId);

      try {
        // Try to create task in ProductionQueue entity
        await base44.entities.ProductionQueue.create({
          task_type: "export",
          assigned_to: "human",
          status: "pending",
          input_data: {
            voice_command: true,
            description: content
          }
        });
        
        toast.success(`Task created: "${content}"`);
      } catch (error) {
        console.error("Task creation error:", error);
        toast.error("Failed to create task");
      }
    };

    const handleSearchResearch = async (e) => {
      const { query } = e.detail;
      const eventId = `search-${Date.now()}`;
      
      if (handledRef.current.has(eventId)) return;
      handledRef.current.add(eventId);

      try {
        if (!query) {
          toast.info("Please specify what to search for");
          return;
        }

        // Search ResearchDocument entity
        const results = await base44.entities.ResearchDocument.filter({});
        const filtered = results.filter(doc => 
          doc.title?.toLowerCase().includes(query.toLowerCase()) ||
          doc.summary?.toLowerCase().includes(query.toLowerCase()) ||
          doc.key_points?.some(kp => kp?.toLowerCase().includes(query.toLowerCase()))
        );

        if (filtered.length === 0) {
          toast.info(`No research documents found for "${query}"`);
        } else {
          toast.success(`Found ${filtered.length} research document(s) matching "${query}"`);
          // Dispatch event to navigate or display results
          window.dispatchEvent(new CustomEvent("voice-command:research-results", {
            detail: { query, results: filtered }
          }));
        }
      } catch (error) {
        console.error("Research search error:", error);
        toast.error("Failed to search research documents");
      }
    };

    window.addEventListener("voice-command:create-task", handleCreateTask);
    window.addEventListener("voice-command:search-research", handleSearchResearch);

    return () => {
      window.removeEventListener("voice-command:create-task", handleCreateTask);
      window.removeEventListener("voice-command:search-research", handleSearchResearch);
    };
  }, []);

  return null;
}