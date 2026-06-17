import React from "react";

interface KPICardDarkProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendLabel?: string;
}

export default function KPICardDark({ title, value, icon, trend, trendLabel }: KPICardDarkProps) {
  return (
    <div className="bg-[#6F4E37] text-white rounded-xl shadow-lg p-5 flex flex-col justify-between relative overflow-hidden group hover:bg-[#5C4033] transition-colors h-40">
      
      {/* Top section: Icon and Trend */}
      <div className="flex justify-between items-start mb-2">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-white/10 border border-white/20 shadow-sm">
          <span className="material-symbols-outlined text-[28px] text-[#F5ECD7]">{icon}</span>
        </div>
        
        {trend && (
          <div className="flex flex-col items-end">
            <span className="font-bold text-lg text-[#F5ECD7]">{trend}</span>
            {trendLabel && (
              <span className="text-[10px] uppercase tracking-wider text-white/70">{trendLabel}</span>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-white/20 my-2"></div>

      {/* Bottom section: Title and Value */}
      <div className="flex flex-col">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/80 mb-1">{title}</h3>
        <p className="font-headline-xl text-3xl font-bold text-[#F5ECD7] truncate">{value}</p>
      </div>

      {/* Subtle decoration */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
    </div>
  );
}
