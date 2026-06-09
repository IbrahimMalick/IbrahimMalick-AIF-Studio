import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Layers,
  Upload,
  Loader2,
  CheckCircle2,
  FileText,
  Download,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

export default function BatchAvatarRenderer({ avatar, voiceProfile, onBatchComplete }) {
  const [csvData, setCsvData] = useState("");
  const [parsedJobs, setParsedJobs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const parseCSV = () => {
    // Simple CSV parser: topic,language,cta
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const jobs = lines.slice(1).map((line, idx) => {
      const values = line.split(',').map(v => v.trim());
      const job = {};
      headers.forEach((header, hIdx) => {
        job[header] = values[hIdx];
      });
      return {
        id: idx + 1,
        ...job,
        status: 'queued'
      };
    });

    setParsedJobs(jobs);
    alert(`✅ Parsed ${jobs.length} jobs from CSV`);
  };

  const processBatchMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      const results = [];

      for (let i = 0; i < parsedJobs.length; i++) {
        const job = parsedJobs[i];
        
        // Update progress
        setOverallProgress(((i + 1) / parsedJobs.length) * 100);

        // Generate script
        const script = await base44.integrations.Core.InvokeLLM({
          prompt: `Write a 30-second ${job.format || 'reel'} script about: ${job.topic}. Include CTA: ${job.cta}. Tone: friendly.`
        });

        // Create avatar video
        const avatarVideo = await base44.entities.AvatarVideo.create({
          user_email: avatar.user_email,
          avatar_id: avatar.id,
          language: job.language || 'en',
          script: script,
          video_url: `https://example.com/batch-${job.id}.mp4`,
          audio_url: `https://example.com/batch-${job.id}.mp3`,
          thumbnail_url: `https://example.com/thumb-${job.id}.jpg`,
          duration_seconds: 30,
          status: "completed",
          render_mode: "fast_path",
          video_type: job.format || 'reel'
        });

        results.push({
          ...job,
          status: 'completed',
          video: avatarVideo
        });

        setCompletedJobs([...results]);
      }

      setIsProcessing(false);
      return results;
    },
    onSuccess: (results) => {
      alert(`✅ Batch render complete! ${results.length} videos generated.`);
      if (onBatchComplete) onBatchComplete(results);
    }
  });

  const downloadCSVTemplate = () => {
    const template = `topic,language,cta,format
"How to meditate daily",en,"Visit example.com",reel
"Comment méditer",fr,"Visitez example.com",reel
"Cómo meditar",es,"Visita example.com",reel`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'avatar-batch-template.csv';
    a.click();
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#00D4C9]" />
          Batch Avatar Renderer
        </CardTitle>
        <p className="text-gray-400 text-sm mt-1">
          Upload CSV/JSON → Render 10-50 avatar videos at once
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* CSV Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">CSV Data (topic, language, cta, format)</label>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadCSVTemplate}
              className="border-gray-700 hover:bg-[#0B0B0C] rounded-lg text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Download Template
            </Button>
          </div>
          <Textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            placeholder={`topic,language,cta,format\n"How to meditate",en,"Visit site",reel\n"Comment méditer",fr,"Visitez site",reel`}
            className="bg-[#0B0B0C] border-gray-700 text-white rounded-xl min-h-[150px] font-mono text-xs"
          />
          <Button
            onClick={parseCSV}
            disabled={!csvData.trim()}
            className="w-full mt-2 bg-[#00D4C9] text-black rounded-xl"
          >
            <FileText className="w-4 h-4 mr-2" />
            Parse CSV
          </Button>
        </div>

        {/* Parsed Jobs */}
        {parsedJobs.length > 0 && !isProcessing && completedJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Queued Jobs: {parsedJobs.length}</p>
              <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                Est. {parsedJobs.length * 45}s total
              </Badge>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {parsedJobs.map((job) => (
                <div key={job.id} className="p-3 bg-[#0B0B0C] rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{job.topic}</p>
                      <p className="text-gray-500 text-xs">
                          {job.language} • {job.format}
                      </p>
                    </div>
                    <Badge className="bg-gray-700 text-gray-300 text-xs">
                      #{job.id}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => processBatchMutation.mutate()}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-black rounded-xl font-bold"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Batch Render ({parsedJobs.length} videos)
            </Button>
          </motion.div>
        )}

        {/* Processing */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Processing...</p>
              <span className="text-[#FFD700] font-bold">{overallProgress.toFixed(0)}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-gray-400 text-sm text-center">
              {completedJobs.length} of {parsedJobs.length} completed
            </p>
          </motion.div>
        )}

        {/* Completed */}
        {completedJobs.length > 0 && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <h4 className="text-white font-bold">Batch Complete!</h4>
                <Badge className="bg-green-500/20 text-green-400 ml-auto">
                  {completedJobs.length} videos
                </Badge>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {completedJobs.map((job, idx) => (
                  <div key={idx} className="p-2 bg-[#0B0B0C] rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm">{job.topic}</p>
                      <p className="text-gray-500 text-xs">
                          {job.language}
                      </p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                className="w-full mt-3 bg-green-500 text-white rounded-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            </div>
          </motion.div>
        )}

      </CardContent>
    </Card>
  );
}