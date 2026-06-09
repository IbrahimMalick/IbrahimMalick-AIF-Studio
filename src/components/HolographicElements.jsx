// Reusable holographic UI components and effects

export const HolographicButton = ({ children, className = "", ...props }) => (
  <button
    className={`relative bg-gradient-to-r from-holographic-cyan via-holographic-purple to-holographic-pink px-6 py-2 rounded-lg font-semibold text-white shadow-holographic hover:shadow-holographic-lg transition-all duration-300 overflow-hidden group ${className}`}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-holographic-cyan via-holographic-purple to-holographic-pink opacity-0 group-hover:opacity-20 transition-opacity" />
    <span className="relative">{children}</span>
  </button>
);

export const HolographicCard = ({ children, className = "" }) => (
  <div className={`backdrop-blur-md bg-gradient-to-br from-slate-900/40 via-slate-900/20 to-slate-900/40 border border-holographic-cyan/30 rounded-2xl p-6 shadow-holographic hover:shadow-holographic-lg transition-all duration-300 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-holographic-cyan/5 to-holographic-purple/5 rounded-2xl pointer-events-none" />
    <div className="relative">{children}</div>
  </div>
);

export const HolographicText = ({ children, className = "" }) => (
  <span className={`bg-gradient-to-r from-holographic-cyan via-holographic-purple to-holographic-pink bg-clip-text text-transparent animate-holographic-glow ${className}`}>
    {children}
  </span>
);

export const AuroraGradient = ({ children, className = "" }) => (
  <div className={`bg-gradient-to-r from-holographic-cyan via-holographic-purple to-holographic-pink animate-shimmer bg-[length:200%_100%] rounded-xl p-[1px] ${className}`}>
    <div className="bg-slate-900 rounded-xl">
      {children}
    </div>
  </div>
);

export const GlowEffect = ({ color = "cyan", children, className = "" }) => {
  const shadowMap = {
    cyan: "shadow-glow-cyan",
    purple: "shadow-glow-purple",
    pink: "shadow-glow-pink",
  };
  return (
    <div className={`${shadowMap[color]} ${className}`}>
      {children}
    </div>
  );
};