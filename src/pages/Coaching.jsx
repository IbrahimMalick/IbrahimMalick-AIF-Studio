
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  User,
  Award,
  BookOpen,
  MessageCircle,
  Sparkles,
  Trophy,
  Flame // Changed from Fire to Flame
} from "lucide-react";
import { motion } from "framer-motion";
import { useAudioFeedback } from "@/components/AudioSystem";
import { showToast } from "@/components/ToastNotification";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Coaching() {
  const queryClient = useQueryClient();
  const audio = useAudioFeedback();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(console.error);
  }, []);

  const { data: mentorshipProgram } = useQuery({
    queryKey: ["mentorshipProgram", user?.email],
    queryFn: async () => {
      const programs = await base44.entities.MentorshipProgram.filter({
        user_email: user.email,
        status: "active"
      }, "-created_date", 1);
      return programs[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: recentSessions = [] } = useQuery({
    queryKey: ["coachingSessions", user?.email],
    queryFn: () => base44.entities.CoachingSession.filter({
      user_email: user.email
    }, "-created_date", 10),
    enabled: !!user?.email
  });

  const { data: activeGoals = [] } = useQuery({
    queryKey: ["goals", user?.email],
    queryFn: () => base44.entities.Goal.filter({
      user_email: user.email,
      status: "in_progress"
    }, "-priority", 20),
    enabled: !!user?.email
  });

  const { data: nextCheckIn } = useQuery({
    queryKey: ["nextAccountabilityCheck", user?.email],
    queryFn: async () => {
      const checks = await base44.entities.AccountabilityCheck.filter({
        user_email: user.email,
        completed: false
      }, "scheduled_time", 1);
      return checks[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: learningProgress = [] } = useQuery({
    queryKey: ["userProgress", user?.email],
    queryFn: () => base44.entities.UserProgress.filter({
      user_email: user.email,
      status: "in_progress"
    }, "-updated_date", 5),
    enabled: !!user?.email
  });

  const startCoachingSessionMutation = useMutation({
    mutationFn: async (sessionType) => {
      const session = await base44.entities.CoachingSession.create({
        user_email: user.email,
        session_id: `session_${Date.now()}`,
        session_type: sessionType,
        status: "in_progress",
        conversation_history: [],
        started_at: new Date().toISOString()
      });
      return session;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries(["coachingSessions"]);
      showToast("Coaching session started! 🎯", "success");
      audio?.playSuccess();
      // Navigate to coaching chat
      window.location.href = createPageUrl(`CoachingChat?session=${session.id}`);
    }
  });

  const completeCheckInMutation = useMutation({
    mutationFn: async (checkInData) => {
      await base44.entities.AccountabilityCheck.update(nextCheckIn.id, {
        completed: true,
        completed_at: new Date().toISOString(),
        user_response: checkInData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["nextAccountabilityCheck"]);
      showToast("Check-in completed! Keep crushing it! 🔥", "success");
      audio?.playProsperityChime();
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <Brain className="w-12 h-12 text-[#FFD700] animate-spin" />
      </div>
    );
  }

  const phaseProgress = {
    foundation: 25,
    growth: 50,
    scaling: 75,
    mastery: 100
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 heading-font">
              AI Coaching & Mentorship
            </h1>
            <p className="text-gray-400">Your personal AI coach for growth and success</p>
          </div>
          <Button
            onClick={() => startCoachingSessionMutation.mutate("goal_setting")}
            className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold rounded-xl"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Start Coaching Session
          </Button>
        </div>

        {/* Mentorship Program Overview */}
        {mentorshipProgram && (
          <Card className="bg-[#111317] border-[#FFD700]/20 rounded-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-[#FFD700] via-[#00D4C9] to-[#FF6B9D]" />
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 heading-font">
                    {mentorshipProgram.program_name}
                  </h2>
                  <Badge className="bg-[#FFD700]/20 text-[#FFD700]">
                    {mentorshipProgram.program_type}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Current Phase</p>
                  <p className="text-2xl font-bold text-[#00D4C9] heading-font">
                    {mentorshipProgram.current_phase}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Program Progress</span>
                  <span className="text-white font-semibold">
                    {phaseProgress[mentorshipProgram.current_phase]}%
                  </span>
                </div>
                <Progress 
                  value={phaseProgress[mentorshipProgram.current_phase]} 
                  className="h-3"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-[#0B0B0C] p-4 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Sessions</p>
                  <p className="text-2xl font-bold text-white">{mentorshipProgram.total_sessions}</p>
                </div>
                <div className="bg-[#0B0B0C] p-4 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Accountability</p>
                  <p className="text-2xl font-bold text-[#00FF88]">{mentorshipProgram.accountability_score}%</p>
                </div>
                <div className="bg-[#0B0B0C] p-4 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Skills Learned</p>
                  <p className="text-2xl font-bold text-[#00D4C9]">{mentorshipProgram.skills_learned?.length || 0}</p>
                </div>
                <div className="bg-[#0B0B0C] p-4 rounded-xl">
                  <p className="text-gray-400 text-sm mb-1">Revenue</p>
                  <p className="text-2xl font-bold text-[#FFD700]">
                    ${mentorshipProgram.growth_metrics?.revenue_generated?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Check-In Alert */}
        {nextCheckIn && !nextCheckIn.completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[#FF6B9D]/20 to-[#C44569]/20 border border-[#FF6B9D]/30 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#FF6B9D] rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Accountability Check-In Due</h3>
                  <p className="text-gray-300">
                    {nextCheckIn.check_type.replace('_', ' ')} - 
                    Due {new Date(nextCheckIn.scheduled_time).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  // Open check-in modal
                  showToast("Opening check-in form...", "info");
                }}
                className="bg-[#FF6B9D] hover:bg-[#C44569] text-white rounded-xl"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete Now
              </Button>
            </div>
          </motion.div>
        )}

        {/* Active Goals */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white heading-font">Active Goals</h2>
            <Button
              variant="outline"
              className="border-gray-700 text-white rounded-xl"
              onClick={() => startCoachingSessionMutation.mutate("goal_setting")}
            >
              <Target className="w-4 h-4 mr-2" />
              Set New Goal
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeGoals.length > 0 ? (
              activeGoals.map((goal, idx) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700]/30 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge className={`${
                          goal.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          goal.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {goal.priority} priority
                        </Badge>
                        <Target className="w-5 h-5 text-[#FFD700]" />
                      </div>
                      <CardTitle className="text-white">{goal.goal_title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Target</p>
                          <p className="text-white font-semibold">{goal.target_metric}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Current Progress</p>
                          <p className="text-[#00D4C9] font-semibold">{goal.current_value || "Not started"}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Deadline</p>
                          <p className="text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(goal.target_date).toLocaleDateString()}
                          </p>
                        </div>
                        {goal.milestones && goal.milestones.length > 0 && (
                          <div>
                            <p className="text-gray-400 text-sm mb-2">Milestones</p>
                            <div className="space-y-1">
                              {goal.milestones.map((m, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  {m.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-gray-500" />
                                  )}
                                  <span className={m.completed ? "text-green-400" : "text-gray-400"}>
                                    {m.milestone}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-800 rounded-2xl">
                <Target className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-4">No active goals yet</p>
                <Button
                  onClick={() => startCoachingSessionMutation.mutate("goal_setting")}
                  className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black rounded-xl"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Set Your First Goal
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Coaching Sessions */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 heading-font">Recent Sessions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {recentSessions.slice(0, 4).map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold mb-1">
                          {session.session_type.replace('_', ' ')}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {new Date(session.started_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`${
                        session.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        session.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {session.status}
                      </Badge>
                    </div>
                    {session.action_items && session.action_items.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-gray-400 text-sm">Action Items:</p>
                        {session.action_items.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm">
                            {item.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                            )}
                            <span className={item.completed ? "text-green-400 line-through" : "text-white"}>
                              {item.task}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Learning Progress */}
        {learningProgress.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 heading-font">Learning Path</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {learningProgress.map((progress, idx) => (
                <motion.div
                  key={progress.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-[#111317] border-gray-800 rounded-2xl hover:border-[#00D4C9]/30 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <BookOpen className="w-8 h-8 text-[#00D4C9]" />
                        <Badge className="bg-[#00D4C9]/20 text-[#00D4C9]">
                          {progress.progress_percentage}%
                        </Badge>
                      </div>
                      <h3 className="text-white font-semibold mb-2">Module {progress.module_id}</h3>
                      <Progress value={progress.progress_percentage} className="mb-3" />
                      <p className="text-gray-400 text-sm">
                        {progress.lessons_completed?.length || 0} lessons completed
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
