import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  Zap,
  TrendingUp,
  Award,
  Gift,
  Sparkles,
  Crown,
  Flame,
  Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioFeedback } from "./AudioSystem";
import { showToast } from "./ToastNotification";

/**
 * Gamification System - XP, Levels, Achievements, Rewards
 * Tracks user progress and shows celebratory animations
 */

export default function GamificationSystem({ user }) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);
  const audio = useAudioFeedback();
  const queryClient = useQueryClient();

  const { data: creatorLevel } = useQuery({
    queryKey: ["creatorLevel", user?.email],
    queryFn: async () => {
      const levels = await base44.entities.CreatorLevel.filter({ user_email: user.email });
      if (levels.length === 0) {
        return await base44.entities.CreatorLevel.create({
          user_email: user.email,
          current_level: "bronze",
          experience_points: 0,
          level_progress: 0,
          badges_earned: [],
          achievements: [],
          stats: {
            videos_created: 0,
            posts_published: 0,
            total_engagement: 0,
            revenue_generated: 0,
            streak_days: 0
          }
        });
      }
      return levels[0];
    },
    enabled: !!user?.email
  });

  const { data: currency } = useQuery({
    queryKey: ["virtualCurrency", user?.email],
    queryFn: async () => {
      const wallets = await base44.entities.VirtualCurrency.filter({ user_email: user.email });
      if (wallets.length === 0) {
        return await base44.entities.VirtualCurrency.create({
          user_email: user.email,
          total_coins: 0,
          coins_spent: 0,
          coins_available: 0,
          transaction_history: []
        });
      }
      return wallets[0];
    },
    enabled: !!user?.email
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ["userAchievements", user?.email],
    queryFn: () => base44.entities.UserAchievement.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: streak } = useQuery({
    queryKey: ["dailyStreak", user?.email],
    queryFn: async () => {
      const streaks = await base44.entities.DailyStreak.filter({ user_email: user.email });
      if (streaks.length === 0) {
        return await base44.entities.DailyStreak.create({
          user_email: user.email,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: new Date().toISOString().split('T')[0]
        });
      }
      return streaks[0];
    },
    enabled: !!user?.email
  });

  // Calculate level requirements
  const getLevelRequirements = (level) => {
    const requirements = {
      bronze: 0,
      silver: 500,
      gold: 2000,
      platinum: 5000,
      diamond: 10000
    };
    return requirements[level] || 0;
  };

  const getNextLevel = (currentLevel) => {
    const levels = ["bronze", "silver", "gold", "platinum", "diamond"];
    const currentIndex = levels.indexOf(currentLevel);
    return levels[currentIndex + 1] || "diamond";
  };

  // Check for level up
  useEffect(() => {
    if (!creatorLevel) return;

    const currentLevelXP = getLevelRequirements(creatorLevel.current_level);
    const nextLevelXP = getLevelRequirements(getNextLevel(creatorLevel.current_level));
    
    if (creatorLevel.experience_points >= nextLevelXP && nextLevelXP > 0) {
      handleLevelUp();
    }
  }, [creatorLevel?.experience_points]);

  const handleLevelUp = async () => {
    const newLevel = getNextLevel(creatorLevel.current_level);
    
    try {
      await base44.entities.CreatorLevel.update(creatorLevel.id, {
        current_level: newLevel,
        level_progress: 0
      });

      setShowLevelUp(true);
      audio?.playProsperityChime();
      
      setTimeout(() => setShowLevelUp(false), 5000);

      // Award level up rewards
      const rewards = {
        silver: { coins: 100, xp: 0 },
        gold: { coins: 250, xp: 0 },
        platinum: { coins: 500, xp: 0 },
        diamond: { coins: 1000, xp: 0 }
      };

      if (rewards[newLevel]) {
        await awardCoins(rewards[newLevel].coins, `Level up to ${newLevel}`);
      }

      queryClient.invalidateQueries(["creatorLevel"]);
    } catch (error) {
      console.error("Error leveling up:", error);
    }
  };

  const awardCoins = async (amount, reason) => {
    if (!currency) return;

    try {
      const newTransaction = {
        type: "earned",
        amount: amount,
        reason: reason,
        timestamp: new Date().toISOString()
      };

      await base44.entities.VirtualCurrency.update(currency.id, {
        total_coins: (currency.total_coins || 0) + amount,
        coins_available: (currency.coins_available || 0) + amount,
        transaction_history: [...(currency.transaction_history || []), newTransaction]
      });

      queryClient.invalidateQueries(["virtualCurrency"]);
    } catch (error) {
      console.error("Error awarding coins:", error);
    }
  };

  if (!creatorLevel || !currency) {
    return null;
  }

  const currentLevelXP = getLevelRequirements(creatorLevel.current_level);
  const nextLevelXP = getLevelRequirements(getNextLevel(creatorLevel.current_level));
  const progressToNextLevel = nextLevelXP > 0 
    ? ((creatorLevel.experience_points - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    : 100;

  return (
    <>
      {/* Compact Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-16 right-4 z-30 w-64"
      >
        <Card className="bg-[#111317]/95 border-gray-800 rounded-xl backdrop-blur-xl shadow-xl">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown className={`w-4 h-4 ${
                  creatorLevel.current_level === 'diamond' ? 'text-[#FFD700]' :
                  creatorLevel.current_level === 'platinum' ? 'text-purple-400' :
                  creatorLevel.current_level === 'gold' ? 'text-yellow-500' :
                  creatorLevel.current_level === 'silver' ? 'text-gray-300' :
                  'text-orange-600'
                }`} />
                <span className="text-white text-sm font-bold capitalize">
                  {creatorLevel.current_level}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-white text-sm font-bold">{streak?.current_streak || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-[#FFD700]" />
                  <span className="text-white text-sm font-bold">{currency.coins_available || 0}</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-xs">{creatorLevel.experience_points} XP</span>
                <span className="text-gray-400 text-xs">{nextLevelXP} XP</span>
              </div>
              <Progress value={progressToNextLevel} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Level Up Animation */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
              className="text-center"
            >
              <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="mb-6"
              >
                <Crown className="w-32 h-32 mx-auto text-[#FFD700] drop-shadow-2xl" />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-6xl font-bold text-white mb-4 heading-font"
                style={{
                  textShadow: "0 0 30px rgba(255, 215, 0, 0.8)"
                }}
              >
                LEVEL UP!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl text-[#FFD700] font-bold capitalize mb-6"
              >
                {getNextLevel(creatorLevel.current_level)} Tier Unlocked!
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Badge className="bg-[#FFD700] text-black text-lg px-6 py-2">
                  <Sparkles className="w-5 h-5 mr-2" />
                  New Rewards Available!
                </Badge>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Unlock Animation */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-24 right-4 z-40 w-80"
          >
            <Card className="bg-gradient-to-r from-[#FFD700]/20 to-[#00D4C9]/20 border-[#FFD700] rounded-2xl shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Trophy className="w-12 h-12 text-[#FFD700] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white font-bold mb-1">Achievement Unlocked!</p>
                    <p className="text-[#FFD700] text-sm">{showAchievement.achievement_name}</p>
                    <p className="text-gray-300 text-xs mt-2">{showAchievement.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        +{showAchievement.xp_reward} XP
                      </Badge>
                      {showAchievement.coin_reward > 0 && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                          +{showAchievement.coin_reward} Coins
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}