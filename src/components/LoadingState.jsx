import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function LoadingState({ message = "Loading...", size = "default" }) {
  const sizes = {
    small: { spinner: "w-8 h-8", text: "text-sm" },
    default: { spinner: "w-12 h-12", text: "text-base" },
    large: { spinner: "w-16 h-16", text: "text-lg" }
  };

  const sizeClasses = sizes[size];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="mb-4"
      >
        <Loader2 className={`${sizeClasses.spinner} text-[#FFD700]`} />
      </motion.div>
      <p className={`${sizeClasses.text} text-gray-400`}>{message}</p>
    </div>
  );
}

export function LoadingSkeleton({ type = "card", count = 1 }) {
  const skeletons = {
    card: (
      <div className="bg-[#111317] border border-gray-800 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-3/4 mb-4" />
        <div className="h-4 bg-gray-800 rounded w-full mb-2" />
        <div className="h-4 bg-gray-800 rounded w-5/6" />
      </div>
    ),
    list: (
      <div className="bg-[#111317] border border-gray-800 rounded-xl p-4 animate-pulse flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-800 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-800 rounded w-1/2" />
        </div>
      </div>
    ),
    table: (
      <div className="bg-[#111317] border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-800 animate-pulse">
          <div className="h-4 bg-gray-800 rounded w-1/4" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-800 animate-pulse flex gap-4">
            <div className="h-4 bg-gray-800 rounded w-1/4" />
            <div className="h-4 bg-gray-800 rounded w-1/3" />
            <div className="h-4 bg-gray-800 rounded w-1/6" />
          </div>
        ))}
      </div>
    )
  };

  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i}>{skeletons[type]}</div>
      ))}
    </div>
  );
}