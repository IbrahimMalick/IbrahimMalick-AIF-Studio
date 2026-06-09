import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  ShoppingBag,
  Flame,
  Star,
  Crown,
  Zap,
  Gift,
  Lock,
  Check,
  Sparkles,
  Coins
} from "lucide-react";
import { motion } from "framer-motion";
import { useAudioFeedback } from "@/components/AudioSystem";
import { showToast } from "@/components/ToastNotification";
import { useState, useEffect } from "react";

export default function Rewards() {
  const [user, setUser] = useState(null);
  const audio = useAudioFeedback();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: creatorLevel } = useQuery({
    queryKey: ["creatorLevel", user?.email],
    queryFn: async () => {
      const levels = await base44.entities.CreatorLevel.filter({ user_email: user.email });
      return levels[0] || null;
    },
    enabled: !!user
  });

  const { data: currency } = useQuery({
    queryKey: ["virtualCurrency", user?.email],
    queryFn: async () => {
      const wallets = await base44.entities.VirtualCurrency.filter({ user_email: user.email });
      return wallets[0] || null;
    },
    enabled: !!user
  });

  const { data: shopItems = [] } = useQuery({
    queryKey: ["rewardShop"],
    queryFn: () => base44.entities.RewardShop.filter({ is_active: true }),
  });

  const { data: userPurchases = [] } = useQuery({
    queryKey: ["userPurchases", user?.email],
    queryFn: () => base44.entities.UserPurchase.filter({ user_email: user.email }),
    enabled: !!user
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => base44.entities.Achievement.list(),
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ["userAchievements", user?.email],
    queryFn: () => base44.entities.UserAchievement.filter({ user_email: user.email }),
    enabled: !!user
  });

  const purchaseItemMutation = useMutation({
    mutationFn: async (item) => {
      if ((currency?.coins_available || 0) < item.coin_price) {
        throw new Error("Not enough coins!");
      }

      // Deduct coins
      await base44.entities.VirtualCurrency.update(currency.id, {
        coins_spent: (currency.coins_spent || 0) + item.coin_price,
        coins_available: (currency.coins_available || 0) - item.coin_price,
        transaction_history: [
          ...(currency.transaction_history || []),
          {
            type: "spent",
            amount: item.coin_price,
            reason: `Purchased: ${item.item_name}`,
            timestamp: new Date().toISOString()
          }
        ]
      });

      // Create purchase record
      await base44.entities.UserPurchase.create({
        user_email: user.email,
        item_id: item.item_id,
        coins_spent: item.coin_price,
        purchased_at: new Date().toISOString()
      });

      // Update stock if limited
      if (item.is_limited_edition && item.stock_available > 0) {
        await base44.entities.RewardShop.update(item.id, {
          stock_available: item.stock_available - 1,
          purchase_count: (item.purchase_count || 0) + 1
        });
      }
    },
    onSuccess: () => {
      audio?.playProsperityChime();
      showToast("Purchase successful! 🎉", "success");
      queryClient.invalidateQueries(["virtualCurrency"]);
      queryClient.invalidateQueries(["userPurchases"]);
      queryClient.invalidateQueries(["rewardShop"]);
    },
    onError: (error) => {
      audio?.playError();
      showToast(error.message, "error");
    }
  });

  const canPurchase = (item) => {
    const hasEnoughCoins = (currency?.coins_available || 0) >= item.coin_price;
    const meetsXPRequirement = !item.xp_required || (creatorLevel?.experience_points || 0) >= item.xp_required;
    const meetsLevelRequirement = !item.level_required || (creatorLevel?.current_level || "bronze") >= item.level_required;
    const alreadyOwned = userPurchases.some(p => p.item_id === item.item_id);
    const inStock = !item.is_limited_edition || item.stock_available > 0;
    
    return hasEnoughCoins && meetsXPRequirement && meetsLevelRequirement && !alreadyOwned && inStock;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 heading-font">Rewards Center</h1>
            <p className="text-gray-400">Spend coins, unlock achievements, level up!</p>
          </div>
          
          <div className="flex gap-4">
            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <Coins className="w-8 h-8 text-[#FFD700]" />
                <div>
                  <p className="text-gray-400 text-xs">Your Coins</p>
                  <p className="text-2xl font-bold text-white heading-font">{currency?.coins_available || 0}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#111317] border-gray-800 rounded-xl">
              <CardContent className="p-4 flex items-center gap-3">
                <Star className="w-8 h-8 text-[#00D4C9]" />
                <div>
                  <p className="text-gray-400 text-xs">Your XP</p>
                  <p className="text-2xl font-bold text-white heading-font">{creatorLevel?.experience_points || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#FFD700]" />
            Reward Shop
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shopItems.map((item, idx) => {
              const owned = userPurchases.some(p => p.item_id === item.item_id);
              const canBuy = canPurchase(item);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={`bg-[#111317] border-gray-800 rounded-2xl hover:border-[#FFD700] transition-all ${
                    owned ? 'border-green-500' : ''
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-white font-bold mb-1">{item.item_name}</h3>
                          <p className="text-gray-400 text-sm">{item.description}</p>
                        </div>
                        {owned && <Check className="w-6 h-6 text-green-400" />}
                        {!canBuy && !owned && <Lock className="w-6 h-6 text-gray-600" />}
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Coins className="w-5 h-5 text-[#FFD700]" />
                          <span className="text-[#FFD700] font-bold text-xl">{item.coin_price}</span>
                        </div>
                        
                        {item.is_limited_edition && (
                          <Badge className="bg-red-500/20 text-red-400">
                            {item.stock_available} left!
                          </Badge>
                        )}
                      </div>
                      
                      {(item.xp_required || item.level_required) && (
                        <div className="flex gap-2 mb-4">
                          {item.xp_required && (
                            <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                              {item.xp_required} XP required
                            </Badge>
                          )}
                          {item.level_required && (
                            <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                              Level {item.level_required}+
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <Button
                        onClick={() => purchaseItemMutation.mutate(item)}
                        disabled={!canBuy || owned || purchaseItemMutation.isPending}
                        className={`w-full ${
                          owned ? 'bg-green-500/20 text-green-400' :
                          canBuy ? 'bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold' :
                          'bg-gray-700 text-gray-500'
                        }`}
                      >
                        {owned ? "Owned" : canBuy ? "Purchase" : "Locked"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#FFD700]" />
            Achievements ({userAchievements.length}/{achievements.length})
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, idx) => {
              const unlocked = userAchievements.some(ua => ua.achievement_id === achievement.achievement_id);
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`bg-[#111317] border-gray-800 rounded-xl ${
                    unlocked ? 'border-[#FFD700]' : ''
                  }`}>
                    <CardContent className="p-4 text-center">
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${
                        achievement.tier === 'diamond' ? 'from-[#FFD700] to-[#FFA500]' :
                        achievement.tier === 'platinum' ? 'from-purple-500 to-pink-500' :
                        achievement.tier === 'gold' ? 'from-yellow-500 to-orange-500' :
                        achievement.tier === 'silver' ? 'from-gray-300 to-gray-500' :
                        'from-orange-600 to-orange-800'
                      } flex items-center justify-center ${unlocked ? '' : 'opacity-30'}`}>
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className={`font-bold mb-1 ${unlocked ? 'text-white' : 'text-gray-600'}`}>
                        {achievement.achievement_name}
                      </h3>
                      <p className={`text-xs mb-3 ${unlocked ? 'text-gray-400' : 'text-gray-700'}`}>
                        {achievement.description}
                      </p>
                      
                      <div className="flex gap-2 justify-center">
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          {achievement.xp_reward} XP
                        </Badge>
                        {achievement.coin_reward > 0 && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                            {achievement.coin_reward} Coins
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}