import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  History,
  Save,
  RotateCcw,
  GitBranch,
  Clock,
  User,
  CheckCircle2,
  FileText,
  Sparkles,
  Eye,
  Download,
  Loader2,
  Brain,
  AlertTriangle,
  TrendingUp,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VersionHistory({ project, currentUser, onRestoreVersion }) {
  const queryClient = useQueryClient();
  const [versionName, setVersionName] = useState("");
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState([null, null]); // For comparison
  const [versionComparison, setVersionComparison] = useState(null);
  const [isComparingVersions, setIsComparingVersions] = useState(false);

  const { data: versions = [] } = useQuery({
    queryKey: ["versions", project.id],
    queryFn: () => base44.entities.ProjectVersion.filter({ project_id: project.id }, "-version_number"),
  });

  const createVersionMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectVersion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["versions"]);
      setShowCreateVersion(false);
      setVersionName("");
      alert("✅ Version saved!");
    },
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async (version) => {
      const snapshotData = JSON.parse(version.snapshot_data);
      await base44.entities.VideoProject.update(project.id, snapshotData);
      
      // Create new version marking restoration
      await base44.entities.ProjectVersion.create({
        project_id: project.id,
        version_number: versions.length + 1,
        version_name: `Restored from v${version.version_number}`,
        snapshot_data: version.snapshot_data,
        changes_summary: `Restored from version ${version.version_number}`,
        restored_from: version.id,
        is_milestone: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["versions"]);
      queryClient.invalidateQueries(["videoProjects"]);
      onRestoreVersion();
      alert("✅ Version restored successfully!");
    },
  });

  const handleSaveVersion = async () => {
    const nextVersionNumber = versions.length + 1;
    
    await createVersionMutation.mutateAsync({
      project_id: project.id,
      version_number: nextVersionNumber,
      version_name: versionName || `Version ${nextVersionNumber}`,
      snapshot_data: JSON.stringify(project),
      changes_summary: versionName || "Manual save",
      scenes_snapshot: project.scenes,
      export_settings_snapshot: project.export_settings,
      is_autosave: false,
      is_milestone: true,
      milestone_type: "draft"
    });
  };

  // AI Version Comparison
  const handleCompareVersions = async () => {
    if (!selectedVersions[0] || !selectedVersions[1]) {
      alert("Please select two versions to compare");
      return;
    }

    const v1 = versions.find(v => v.id === selectedVersions[0]);
    const v2 = versions.find(v => v.id === selectedVersions[1]);

    if (!v1 || !v2) return;

    setIsComparingVersions(true);
    try {
      const comparison = await base44.integrations.Core.InvokeLLM({
        prompt: `Compare these two versions of a video project and provide detailed analysis:

VERSION 1: ${v1.version_name} (v${v1.version_number})
Created: ${new Date(v1.created_date).toLocaleString()}
By: ${v1.created_by}
Changes: ${v1.changes_summary || 'N/A'}

VERSION 2: ${v2.version_name} (v${v2.version_number})
Created: ${new Date(v2.created_date).toLocaleString()}
By: ${v2.created_by}
Changes: ${v2.changes_summary || 'N/A'}

Analyze and explain the significant changes:

1. MAJOR CHANGES:
   - What changed between versions
   - Visual/editing differences
   - Content modifications
   - Technical changes (resolution, fps, etc.)
   - Impact of each change

2. IMPROVEMENTS:
   - What got better in newer version
   - Quality enhancements
   - Feature additions
   - Technical improvements

3. REGRESSIONS/CONCERNS:
   - What might have gotten worse
   - Potential issues introduced
   - Features removed
   - Quality concerns

4. CREATIVE DIRECTION:
   - How creative direction evolved
   - Style changes
   - Tone/mood shifts
   - Pacing changes

5. TECHNICAL ANALYSIS:
   - File size changes
   - Resolution/quality changes
   - Export settings differences
   - Performance implications

6. RECOMMENDATION:
   - Which version is better overall
   - Reasons for recommendation
   - Situations where each version works best
   - Suggested next steps

Provide clear, actionable insights for the team.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: {
              type: "object",
              properties: {
                total_changes: { type: "number" },
                significant_changes: { type: "number" },
                improvement_score: { type: "number" },
                overall_verdict: { type: "string" },
                recommended_version: { type: "string" }
              }
            },
            major_changes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  change_type: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" },
                  significance: { type: "string" }
                }
              }
            },
            improvements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  description: { type: "string" },
                  benefit: { type: "string" }
                }
              }
            },
            regressions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  concern: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            creative_direction: {
              type: "object",
              properties: {
                style_evolution: { type: "string" },
                tone_changes: { type: "string" },
                pacing_changes: { type: "string" },
                overall_assessment: { type: "string" }
              }
            },
            technical_analysis: {
              type: "object",
              properties: {
                quality_comparison: { type: "string" },
                performance_impact: { type: "string" },
                technical_notes: { type: "array", items: { type: "string" } }
              }
            },
            recommendation: {
              type: "object",
              properties: {
                preferred_version: { type: "string" },
                reasoning: { type: "string" },
                use_cases: {
                  type: "object",
                  properties: {
                    version_1_best_for: { type: "array", items: { type: "string" } },
                    version_2_best_for: { type: "array", items: { type: "string" } }
                  }
                },
                next_steps: { type: "array", items: { type: "string" } }
              }
            }
          }
        }
      });

      setVersionComparison({
        ...comparison,
        version1: v1,
        version2: v2
      });

      alert(`✅ Version Comparison Complete!

📊 ANALYSIS:
• Total Changes: ${comparison.summary.total_changes}
• Significant Changes: ${comparison.summary.significant_changes}
• Improvement Score: ${comparison.summary.improvement_score}/100

🏆 VERDICT: ${comparison.summary.overall_verdict}

📌 Recommended: ${comparison.recommendation.preferred_version}

Check below for detailed comparison!`);

    } catch (error) {
      alert("Error comparing versions. Please try again.");
    }
    setIsComparingVersions(false);
  };

  const getMilestoneColor = (type) => {
    const colors = {
      draft: "bg-blue-500/20 text-blue-400",
      review: "bg-yellow-500/20 text-yellow-400",
      approved: "bg-green-500/20 text-green-400",
      final: "bg-purple-500/20 text-purple-400",
      published: "bg-[#FFD700]/20 text-[#FFD700]"
    };
    return colors[type] || "bg-gray-500/20 text-gray-400";
  };

  const toggleVersionSelection = (versionId, position) => {
    const newSelection = [...selectedVersions];
    newSelection[position] = newSelection[position] === versionId ? null : versionId;
    setSelectedVersions(newSelection);
  };

  return (
    <Card className="bg-[#111317] border-gray-800 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#FFD700]" />
            Version History ({versions.length})
          </CardTitle>
          <div className="flex gap-2">
            {(selectedVersions[0] || selectedVersions[1]) && (
              <Button
                size="sm"
                onClick={handleCompareVersions}
                disabled={!selectedVersions[0] || !selectedVersions[1] || isComparingVersions}
                className="bg-[#9D4EDD] text-white hover:bg-[#8D3ECD]"
              >
                {isComparingVersions ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                AI Compare
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowCreateVersion(!showCreateVersion)}
              className="bg-[#FFD700] text-black hover:bg-[#FFC700] rounded-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Version
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Save New Version */}
        <AnimatePresence>
          {showCreateVersion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#0B0B0C] rounded-xl p-4 border border-gray-800 space-y-3">
                <Input
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="Version name (e.g., Client Review v2)"
                  className="bg-[#111317] border-gray-700 text-white rounded-lg"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowCreateVersion(false)}
                    variant="outline"
                    className="flex-1 border-gray-700 hover:bg-[#111317] rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveVersion}
                    disabled={createVersionMutation.isLoading}
                    className="flex-1 bg-[#FFD700] text-black hover:bg-[#FFC700] rounded-lg"
                  >
                    Save Version
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Version Comparison Display */}
        {versionComparison && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-br from-[#9D4EDD]/10 to-[#FF69B4]/10 border border-[#9D4EDD]/30 rounded-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#9D4EDD]" />
                AI Version Comparison
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setVersionComparison(null)}
                className="text-gray-400"
              >
                ✕
              </Button>
            </div>

            {/* Comparing */}
            <div className="flex items-center gap-4">
              <div className="flex-1 p-3 bg-[#0B0B0C] rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Version {versionComparison.version1.version_number}</p>
                <p className="text-white font-semibold">{versionComparison.version1.version_name}</p>
              </div>
              <Layers className="w-6 h-6 text-[#9D4EDD]" />
              <div className="flex-1 p-3 bg-[#0B0B0C] rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 mb-1">Version {versionComparison.version2.version_number}</p>
                <p className="text-white font-semibold">{versionComparison.version2.version_name}</p>
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-[#0B0B0C] rounded-lg">
                <p className="text-2xl font-bold text-[#00D4C9]">{versionComparison.summary.total_changes}</p>
                <p className="text-xs text-gray-400">Changes</p>
              </div>
              <div className="text-center p-2 bg-[#0B0B0C] rounded-lg">
                <p className="text-2xl font-bold text-[#FFD700]">{versionComparison.summary.significant_changes}</p>
                <p className="text-xs text-gray-400">Significant</p>
              </div>
              <div className="text-center p-2 bg-[#0B0B0C] rounded-lg">
                <p className="text-2xl font-bold text-[#06D6A0]">{versionComparison.summary.improvement_score}</p>
                <p className="text-xs text-gray-400">Score</p>
              </div>
            </div>

            {/* Major Changes */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00D4C9]" />
                Major Changes
              </h4>
              <div className="space-y-2">
                {versionComparison.major_changes.slice(0, 5).map((change, idx) => (
                  <div key={idx} className="p-2 bg-[#0B0B0C] rounded-lg">
                    <div className="flex items-start gap-2">
                      <Badge className={`${
                        change.significance === 'critical' ? 'bg-red-500/20 text-red-400' :
                        change.significance === 'major' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      } h-fit text-xs`}>
                        {change.change_type}
                      </Badge>
                      <div className="flex-1">
                        <p className="text-white text-sm">{change.description}</p>
                        <p className="text-gray-400 text-xs mt-1">Impact: {change.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            {versionComparison.improvements.length > 0 && (
              <div>
                <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Improvements
                </h4>
                <div className="space-y-1">
                  {versionComparison.improvements.slice(0, 3).map((improvement, idx) => (
                    <div key={idx} className="p-2 bg-green-500/5 border border-green-500/20 rounded-lg">
                      <p className="text-green-400 text-sm font-medium">{improvement.area}</p>
                      <p className="text-gray-300 text-xs">{improvement.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regressions */}
            {versionComparison.regressions.length > 0 && (
              <div>
                <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Concerns
                </h4>
                <div className="space-y-1">
                  {versionComparison.regressions.slice(0, 3).map((regression, idx) => (
                    <div key={idx} className="p-2 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Badge className={`${
                          regression.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                          regression.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        } h-fit text-xs`}>
                          {regression.severity}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-yellow-400 text-sm font-medium">{regression.concern}</p>
                          <p className="text-gray-300 text-xs">{regression.description}</p>
                          <p className="text-gray-400 text-xs mt-1">→ {regression.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="p-3 bg-gradient-to-r from-[#FFD700]/10 to-[#FF8C00]/10 border border-[#FFD700]/30 rounded-lg">
              <h4 className="text-white font-semibold text-sm mb-2">🏆 Recommendation</h4>
              <p className="text-gray-300 text-sm mb-2">{versionComparison.recommendation.reasoning}</p>
              <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                Preferred: {versionComparison.recommendation.preferred_version}
              </Badge>
            </div>
          </motion.div>
        )}

        {/* Version Comparison Selection Hint */}
        {!versionComparison && (selectedVersions[0] || selectedVersions[1]) && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-sm">
              {selectedVersions[0] && selectedVersions[1] 
                ? "✅ Two versions selected. Click 'AI Compare' to analyze differences."
                : "Select two versions to compare (click version cards below)"}
            </p>
          </div>
        )}

        {/* Versions List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {versions.map((version, idx) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                selectedVersions.includes(version.id)
                  ? 'border-[#9D4EDD] bg-[#9D4EDD]/5'
                  : 'border-gray-800 bg-[#0B0B0C] hover:border-gray-700'
              }`}
              onClick={() => {
                // Toggle selection for comparison
                if (!selectedVersions[0]) {
                  toggleVersionSelection(version.id, 0);
                } else if (!selectedVersions[1] && version.id !== selectedVersions[0]) {
                  toggleVersionSelection(version.id, 1);
                } else if (selectedVersions[0] === version.id) {
                  toggleVersionSelection(version.id, 0);
                } else if (selectedVersions[1] === version.id) {
                  toggleVersionSelection(version.id, 1);
                }
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-semibold text-sm">
                      {version.version_name || `Version ${version.version_number}`}
                    </h4>
                    {version.is_milestone && (
                      <Badge className={getMilestoneColor(version.milestone_type)}>
                        {version.milestone_type}
                      </Badge>
                    )}
                    {idx === 0 && (
                      <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-xs">
                        Current
                      </Badge>
                    )}
                    {selectedVersions.includes(version.id) && (
                      <Badge className="bg-[#9D4EDD]/20 text-[#9D4EDD] text-xs">
                        ✓ Selected
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs flex items-center gap-2">
                    <User className="w-3 h-3" />
                    {version.created_by}
                    <Clock className="w-3 h-3 ml-2" />
                    {new Date(version.created_date).toLocaleString()}
                  </p>
                  {version.changes_summary && (
                    <p className="text-gray-500 text-xs mt-2">
                      <FileText className="w-3 h-3 inline mr-1" />
                      {version.changes_summary}
                    </p>
                  )}
                </div>

                {idx !== 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Restore to version ${version.version_number}? Current work will be saved as new version.`)) {
                        restoreVersionMutation.mutate(version);
                      }
                    }}
                    className="border-gray-700 hover:bg-[#111317] rounded-lg"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Restore
                  </Button>
                )}
              </div>

              {/* Version Stats */}
              {version.scenes_snapshot && (
                <div className="flex gap-3 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-800">
                  <span>{version.scenes_snapshot.length || 0} scenes</span>
                  {version.export_settings_snapshot && (
                    <>
                      <span>•</span>
                      <span>{version.export_settings_snapshot.codec || 'h264'}</span>
                      <span>•</span>
                      <span>{version.export_settings_snapshot.framerate || 30} fps</span>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          ))}

          {versions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-sm">No versions saved yet</p>
              <p className="text-xs mt-1">Save your first version to track changes</p>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}