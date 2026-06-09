
import React from "react";

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-800 ${className}`}
    {...props}
  >
    <div
      className="h-full flex-1 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] transition-all"
      style={{ width: `${value || 0}%` }}
    />
  </div>
));
Progress.displayName = "Progress";

export { Progress };
