import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {Icon && (
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD700]/20 to-[#00D4C9]/20 flex items-center justify-center mb-6 border border-[#FFD700]/30"
        >
          <Icon className="w-12 h-12 text-[#FFD700]" />
        </motion.div>
      )}
      
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      
      {description && (
        <p className="text-gray-400 max-w-md mb-6">{description}</p>
      )}
      
      <div className="flex gap-3">
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="bg-gradient-to-r from-[#FFD700] to-[#00D4C9] text-black font-semibold px-6"
          >
            {actionLabel}
          </Button>
        )}
        
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            onClick={onSecondaryAction}
            variant="outline"
            className="border-gray-700 text-gray-300"
          >
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </motion.div>
  );
}