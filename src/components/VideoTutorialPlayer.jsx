import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  X,
  Subtitles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioFeedback } from "./AudioSystem";
import { showToast } from "./ToastNotification";

export default function VideoTutorialPlayer({ tutorialId, onClose, autoPlay = false, user }) {
  const [tutorial, setTutorial] = useState(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const videoRef = useRef(null);
  const audio = useAudioFeedback();

  useEffect(() => {
    loadTutorial();
  }, [tutorialId]);

  const loadTutorial = async () => {
    try {
      const tutorials = await base44.entities.VideoTutorial.filter({ tutorial_id: tutorialId });
      if (tutorials.length > 0) {
        setTutorial(tutorials[0]);
        
        // Load user progress
        if (user) {
          const progressRecords = await base44.entities.TutorialProgress.filter({
            user_email: user.email,
            tutorial_id: tutorialId
          });
          
          if (progressRecords.length > 0) {
            setUserProgress(progressRecords[0]);
            setProgress((progressRecords[0].progress_seconds / tutorials[0].duration_seconds) * 100);
          }
        }
      }
    } catch (error) {
      console.error("Error loading tutorial:", error);
    }
  };

  const handleProgress = async () => {
    if (!videoRef.current || !tutorial || !user) return;
    
    const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(currentProgress);

    // Update progress in database every 5 seconds
    if (Math.floor(videoRef.current.currentTime) % 5 === 0) {
      try {
        if (userProgress) {
          await base44.entities.TutorialProgress.update(userProgress.id, {
            progress_seconds: Math.floor(videoRef.current.currentTime),
            completed: currentProgress >= 95,
            last_watched_at: new Date().toISOString(),
            ...(currentProgress >= 95 && { completed_at: new Date().toISOString() })
          });
        } else {
          const newProgress = await base44.entities.TutorialProgress.create({
            user_email: user.email,
            tutorial_id: tutorialId,
            progress_seconds: Math.floor(videoRef.current.currentTime),
            completed: currentProgress >= 95,
            last_watched_at: new Date().toISOString()
          });
          setUserProgress(newProgress);
        }

        // Award XP for completing tutorial
        if (currentProgress >= 95 && !userProgress?.completed) {
          await awardTutorialCompletion();
        }
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }
  };

  const awardTutorialCompletion = async () => {
    try {
      // Award 10 XP and 5 coins for completing tutorial
      audio?.playProsperityChime();
      showToast("Tutorial complete! +10 XP, +5 coins 🎉", "success");

      // Update user stats
      const creatorLevel = await base44.entities.CreatorLevel.filter({ user_email: user.email });
      if (creatorLevel.length > 0) {
        await base44.entities.CreatorLevel.update(creatorLevel[0].id, {
          experience_points: (creatorLevel[0].experience_points || 0) + 10
        });
      }

      const currency = await base44.entities.VirtualCurrency.filter({ user_email: user.email });
      if (currency.length > 0) {
        await base44.entities.VirtualCurrency.update(currency[0].id, {
          total_coins: (currency[0].total_coins || 0) + 5,
          coins_available: (currency[0].coins_available || 0) + 5
        });
      }
    } catch (error) {
      console.error("Error awarding completion:", error);
    }
  };

  const handleFeedback = async (helpful) => {
    if (!userProgress) return;

    try {
      await base44.entities.TutorialProgress.update(userProgress.id, {
        was_helpful: helpful
      });

      await base44.entities.VideoTutorial.update(tutorial.id, {
        helpful_votes: helpful ? (tutorial.helpful_votes || 0) + 1 : tutorial.helpful_votes,
        not_helpful_votes: !helpful ? (tutorial.not_helpful_votes || 0) + 1 : tutorial.not_helpful_votes
      });

      audio?.playSuccess();
      showToast("Thanks for your feedback!", "success");
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  if (!tutorial) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      >
        <Card className="bg-[#111317] border-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
          <CardHeader className="border-b border-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  {tutorial.title}
                  <Badge className={`${
                    tutorial.difficulty_level === 'beginner' ? 'bg-green-500/20 text-green-400' :
                    tutorial.difficulty_level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {tutorial.difficulty_level}
                  </Badge>
                </CardTitle>
                <p className="text-gray-400 text-sm mt-1">{tutorial.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Video Player */}
            <div className="relative bg-black aspect-video">
              <video
                ref={videoRef}
                src={tutorial.video_url}
                className="w-full h-full"
                onTimeUpdate={handleProgress}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  if (progress >= 95) awardTutorialCompletion();
                }}
              />

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <Progress value={progress} className="h-1 mb-4" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (isPlaying) {
                          videoRef.current?.pause();
                        } else {
                          videoRef.current?.play();
                        }
                        audio?.playClick();
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setIsMuted(!isMuted);
                        if (videoRef.current) videoRef.current.muted = !isMuted;
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>

                    <span className="text-white text-sm">
                      {Math.floor(videoRef.current?.currentTime || 0)}s / {tutorial.duration_seconds}s
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSubtitles(!showSubtitles)}
                      className="text-white hover:bg-white/20"
                    >
                      <Subtitles className="w-5 h-5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => videoRef.current?.requestFullscreen()}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback & Next Steps */}
            <div className="p-6 space-y-4">
              {progress >= 95 && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 font-semibold mb-2">✅ Tutorial Complete!</p>
                  <p className="text-gray-300 text-sm">You earned +10 XP and +5 coins</p>
                </div>
              )}

              <div>
                <p className="text-white font-semibold mb-2">Was this tutorial helpful?</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleFeedback(true)}
                    className="border-gray-700 hover:bg-green-500/10 hover:border-green-500"
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Yes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleFeedback(false)}
                    className="border-gray-700 hover:bg-red-500/10 hover:border-red-500"
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    No
                  </Button>
                </div>
              </div>

              {tutorial.next_tutorial_id && (
                <div className="p-4 bg-[#0B0B0C] rounded-xl border border-gray-800">
                  <p className="text-white font-semibold mb-2">Next Tutorial</p>
                  <Button
                    className="w-full bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-bold"
                    onClick={() => {
                      // Load next tutorial
                      audio?.playWhoosh();
                    }}
                  >
                    Continue Learning
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}