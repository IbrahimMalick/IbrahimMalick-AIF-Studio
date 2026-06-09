import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

export default function MobileOptimizedWizard({ steps, currentStep, onStepChange, children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDragEnd = (event, info) => {
    if (!isMobile) return;

    const swipeThreshold = 50;
    
    if (info.offset.x > swipeThreshold && currentStep > 1) {
      setDirection(-1);
      onStepChange(currentStep - 1);
    } else if (info.offset.x < -swipeThreshold && currentStep < steps.length) {
      setDirection(1);
      onStepChange(currentStep + 1);
    }
  };

  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setDirection(1);
      onStepChange(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      onStepChange(currentStep - 1);
    }
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0C] via-[#111317] to-[#0B0B0C] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-xl">Setup Progress</h2>
            <span className="text-[#FFD700] font-semibold">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <Progress 
            value={(currentStep / steps.length) * 100} 
            className="h-3 bg-gray-800"
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;
            
            return (
              <div
                key={step.number}
                className={`flex flex-col items-center gap-2 flex-1 ${
                  isMobile && !isCurrent ? 'hidden' : ''
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-green-500'
                      : isCurrent
                      ? 'bg-[#FFD700]'
                      : 'bg-gray-800'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : (
                    <Icon className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="text-center hidden md:block">
                  <p className={`text-sm font-semibold ${
                    isCurrent ? 'text-[#FFD700]' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Area with Swipe Support */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag={isMobile ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="touch-pan-y"
          >
            <Card className="bg-[#111317] border-gray-800 rounded-2xl">
              <CardContent className="p-6 md:p-8">
                {children}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            variant="outline"
            size="lg"
            className="border-gray-700 hover:bg-gray-800 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            {!isMobile && "Previous"}
          </Button>
          
          <Button
            onClick={goToNextStep}
            disabled={currentStep === steps.length}
            size="lg"
            className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-black font-bold"
          >
            {!isMobile && "Next"}
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Swipe Hint for Mobile */}
        {isMobile && currentStep === 1 && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-400 text-sm mt-4"
          >
            💡 Swipe left or right to navigate
          </motion.p>
        )}
      </div>
    </div>
  );
}