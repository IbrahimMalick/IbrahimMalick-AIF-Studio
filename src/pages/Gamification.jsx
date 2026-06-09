import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  Flame,
  Award,
  Star,
  TrendingUp,
  Zap,
  Crown,
  Gift,
  Users,
  CheckCircle2,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioFeedback } from "@/components/AudioSystem";
import { showToast } from "@/components/ToastNotification";

export default function Gamification() {
  const queryClient = useQueryClient();
  const audio = useAudioFeedback();
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState("achievements");

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // User level and progress
  const { data: creatorLevel } = useQuery({
    queryKey: ["creatorLevel", user?.email],
    queryFn: async () => {
      const levels = await base44.entities.CreatorLevel.filter({
        user_email: user.email
      });
      
      if (levels.length > 0) return levels[0];
      
      return await base44.entities.CreatorLevel.create({
        user_email: user.email,
        current_level: "bronze",
        experience_points: 0
      });
    },
    enabled: !!user?.email
  });

  // Daily streak
  const { data: streak } = useQuery({
    queryKey: ["dailyStreak", user?.email],
    queryFn: async () => {
      const streaks = await base44.entities.DailyStreak.filter({
        user_email: user.email
      });
      
      if (streaks.length > 0) return streaks[0];
      
      return await base44.entities.DailyStreak.create({
        user_email: user.email,
        current_streak: 0,
        longest_streak: 0
      });
    },
    enabled: !!user?.email
  });

  // All achievements
  const { data: allAchievements = [] } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => base44.entities.Achievement.list()
  });

  // User's unlocked achievements
  const unlockedAchievements = creatorLevel?.achievements || [];

  // Active quests
  const { data: quests = [] } = useQuery({
    queryKey: ["quests"],
    queryFn: () => base44.entities.Quest.filter({ is_active: true })
  });

  // User quest progress
  const { data: userQuests = [] } = useQuery({
    queryKey: ["userQuests", user?.email],
    queryFn: () => base44.entities.UserQuest.filter({
      user_email: user.email,
      status: "in_progress"
    }),
    enabled: !!user?.email
  });

  // Level thresholds
  const levelThresholds = {
    bronze: 0,
    silver: 1000,
    gold: 5000,
    platinum: 15000,
    diamond: 50000
  };

  const levels = Object.keys(levelThresholds);
  const currentLevelIndex = levels.indexOf(creatorLevel?.current_level || "bronze");
  const nextLevel = levels[currentLevelIndex + 1];
  const xpToNextLevel = nextLevel ? levelThresholds[nextLevel] - (creatorLevel?.experience_points || 0) : 0;

  const tierColors = {
    bronze: "from-[#CD7F32] to-[#8B5A2B]",
    silver: "from-[#C0C0C0] to-[#808080]",
    gold: "from-[#FFD700] to-[#FFA500]",
    platinum: "from-[#E5E4E2] to-[#B8B8B8]",
    diamond: "from-[#B9F2FF] to-[#00D4FF]"
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Journey</h1>
            <p className="text-gray-400">Track progress, unlock achievements, complete quests</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-[#FF4433]" />
              <span className="text-2xl font-bold text-white">{streak?.current_streak || 0}</span>
              <span className="text-gray-400">day streak</span>
            </div>
            <p className="text-xs text-gray-500">Best: {streak?.longest_streak || 0} days</p>
          </div>
        </div>

        {/* Creator Level Card */}
        <Card className="bg-gradient-to-br from-[#111317] to-[#1A1A1A] border-[#FFD700]/20 rounded-2xl overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${tierColors[creatorLevel?.current_level || "bronze"]}`} />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${tierColors[creatorLevel?.current_level || "bronze"]} flex items-center justify-center`}
                >
                  <Crown className="w-10 h-10 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white capitalize mb-1">
                    {creatorLevel?.current_level || "Bronze"} Creator
                  </h2>
                  <p className="text-[#FFD700] font-semibold text-lg">
                    {creatorLevel?.experience_points || 0} XP
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Rank #{creatorLevel?.rank_position || "—"} globally
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <Badge className="bg-[#FFD700]/20 text-[#FFD700] text-sm mb-2">
                  Level {currentLevelIndex + 1}
                </Badge>
                {nextLevel && (
                  <p className="text-gray-400 text-sm">
                    {xpToNextLevel} XP to {nextLevel}
                  </p>
                )}
              </div>
            </div>

            {nextLevel && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Progress to next level</span>
                  <span className="text-[#FFD700] font-semibold">
                    {Math.round(creatorLevel?.level_progress || 0)}%
                  </span>
                </div>
                <Progress 
                  value={creatorLevel?.level_progress || 0} 
                  className="h-3 bg-gray-800"
                />
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-800">
              {[
                { label: "Videos", value: creatorLevel?.stats?.videos_created || 0, icon: TrendingUp },
                { label: "Posts", value: creatorLevel?.stats?.posts_published || 0, icon: Zap },
                { label: "Engagement", value: creatorLevel?.stats?.total_engagement || 0, icon: Star },
                { label: "Revenue", value: `$${creatorLevel?.stats?.revenue_generated || 0}`, icon: Trophy }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <Icon className="w-5 h-5 text-[#FFD700] mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-gray-500 text-xs">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-800">
          {[
            { id: "achievements", label: "Achievements", icon: Trophy },
            { id: "quests", label: "Quests", icon: Target },
            { id: "leaderboard", label: "Leaderboard", icon: Users }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTab(tab.id);
                  audio?.playClick();
                }}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-[#FFD700] text-[#FFD700]'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {selectedTab === "achievements" && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {allAchievements.map((achievement, idx) => {
                const isUnlocked = unlockedAchievements.some(
                  a => a.achievement_id === achievement.achievement_id
                );
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <Card className={`${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-[#111317] to-[#1A1A1A] border-[#FFD700]/30' 
                        : 'bg-[#0B0B0C] border-gray-800'
                    } rounded-xl relative overflow-hidden`}>
                      <div className={`h-1 bg-gradient-to-r ${tierColors[achievement.tier]}`} />
                      
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                          <Lock className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-3">
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${tierColors[achievement.tier]} flex items-center justify-center flex-shrink-0`}>
                            <Award className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold mb-1">{achievement.achievement_name}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2">{achievement.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge className="bg-[#FFD700]/20 text-[#FFD700] capitalize text-xs">
                            {achievement.tier}
                          </Badge>
                          <span className="text-[#FFD700] font-semibold text-sm">
                            +{achievement.xp_reward} XP
                          </span>
                        </div>
                        
                        {isUnlocked && (
                          <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Unlocked!</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {selectedTab === "quests" && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {quests.map((quest, idx) => {
                const userQuest = userQuests.find(uq => uq.quest_id === quest.quest_id);
                const progress = userQuest?.progress || [];
                const totalProgress = progress.length > 0
                  ? (progress.filter(p => p.completed).length / progress.length) * 100
                  : 0;
                
                return (
                  <motion.div
                    key={quest.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-[#111317] border-gray-800 rounded-xl hover:border-[#FFD700]/30 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
                            quest.difficulty === 'easy' ? 'from-green-500 to-green-600' :
                            quest.difficulty === 'medium' ? 'from-yellow-500 to-orange-500' :
                            quest.difficulty === 'hard' ? 'from-red-500 to-red-600' :
                            'from-purple-500 to-pink-600'
                          } flex items-center justify-center flex-shrink-0`}>
                            <Target className="w-8 h-8 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-white font-bold text-lg mb-1">{quest.quest_name}</h3>
                                <p className="text-gray-400 text-sm">{quest.description}</p>
                              </div>
                              <Badge className="bg-[#FFD700]/20 text-[#FFD700] capitalize">
                                {quest.quest_type}
                              </Badge>
                            </div>
                            
                            {/* Progress */}
                            {userQuest && (
                              <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-400">Progress</span>
                                  <span className="text-[#FFD700] font-semibold">{Math.round(totalProgress)}%</span>
                                </div>
                                <Progress value={totalProgress} className="h-2 bg-gray-800" />
                              </div>
                            )}
                            
                            {/* Rewards */}
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-[#FFD700]" />
                                <span className="text-[#FFD700] font-semibold text-sm">+{quest.xp_reward} XP</span>
                              </div>
                              {quest.bonus_rewards?.map((reward, ridx) => (
                                <div key={ridx} className="flex items-center gap-2">
                                  <Gift className="w-4 h-4 text-[#00D4C9]" />
                                  <span className="text-[#00D4C9] text-sm">{reward.reward_value} {reward.reward_type}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {selectedTab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-[#111317] border-gray-800 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-[#FFD700]" />
                    Global Leaderboard
                  </CardTitle>
                  <p className="text-gray-400 text-sm">Coming soon! Compete with creators worldwide.</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400">Leaderboard launches next week!</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}