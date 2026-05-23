import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'purple' | 'amber' | 'rose';
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export default function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  color = 'blue',
  trend,
  trendDirection = 'neutral'
}: MetricCardProps) {
  
  // Color configuration mapping
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return {
          glow: 'glow-text-green',
          border: 'border-cyber-green/30 hover:border-cyber-green',
          bg: 'bg-cyber-green/5',
          text: 'text-cyber-green',
          iconBg: 'bg-cyber-green/10 text-cyber-green'
        };
      case 'purple':
        return {
          glow: 'glow-text-purple',
          border: 'border-cyber-purple/30 hover:border-cyber-purple',
          bg: 'bg-cyber-purple/5',
          text: 'text-cyber-purple',
          iconBg: 'bg-cyber-purple/10 text-cyber-purple'
        };
      case 'amber':
        return {
          glow: 'glow-text-amber',
          border: 'border-cyber-amber/30 hover:border-cyber-amber',
          bg: 'bg-cyber-amber/5',
          text: 'text-cyber-amber',
          iconBg: 'bg-cyber-amber/10 text-cyber-amber'
        };
      case 'rose':
        return {
          glow: 'glow-text-rose',
          border: 'border-[#ff007f]/30 hover:border-[#ff007f]',
          bg: 'bg-[#ff007f]/5',
          text: 'text-[#ff007f]',
          iconBg: 'bg-[#ff007f]/10 text-[#ff007f]'
        };
      case 'blue':
      default:
        return {
          glow: 'glow-text-blue',
          border: 'border-cyber-blue/30 hover:border-cyber-blue',
          bg: 'bg-cyber-blue/5',
          text: 'text-cyber-blue',
          iconBg: 'bg-cyber-blue/10 text-cyber-blue'
        };
    }
  };

  const c = getColorClasses();

  return (
    <div className={`terminal-panel overflow-hidden border ${c.border} rounded p-4 flex items-center justify-between transition-all duration-300 bg-background-card/90`}>
      
      {/* Metric Content */}
      <div className="space-y-1.5 min-w-0">
        <span className="text-[10px] font-mono font-semibold tracking-wider text-cyber-text uppercase opacity-75 block">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl title-font font-bold font-mono text-slate-100 ${c.glow}`}>
            {value}
          </span>
          {trend && (
            <span className={`text-[10px] font-mono px-1 py-0.5 rounded ${
              trendDirection === 'up' 
                ? 'bg-[#10b981]/15 text-cyber-green' 
                : trendDirection === 'down'
                ? 'bg-cyber-rose/15 text-cyber-rose'
                : 'bg-background-input text-cyber-text'
            }`}>
              {trend}
            </span>
          )}
        </div>
        <span className="text-xs text-cyber-text truncate block">
          {description}
        </span>
      </div>

      {/* Metric Icon */}
      <div className={`p-3 rounded-full shrink-0 ${c.iconBg} shadow-sm border border-current/10`}>
        <Icon className="w-5 h-5" />
      </div>

    </div>
  );
}
