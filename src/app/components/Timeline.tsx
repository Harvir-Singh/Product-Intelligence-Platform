'use client';

import React from 'react';
import { Activity, Clock } from 'lucide-react';
import type { ProductEvent } from '@/lib/types';
import EventCard from './EventCard';

interface TimelineProps {
  events: ProductEvent[];
  highlightCompany?: boolean;
}

export default function Timeline({ events, highlightCompany = true }: TimelineProps) {
  
  if (events.length === 0) {
    return (
      <div className="terminal-panel border border-dashed border-cyber-border rounded-lg p-12 text-center bg-background-card/40">
        <Clock className="w-8 h-8 text-cyber-text opacity-40 mx-auto mb-3" />
        <span className="block font-mono text-sm text-cyber-text uppercase tracking-widest">
          No Strategic Events Recorded
        </span>
        <span className="block text-xs text-cyber-text/60 mt-1">
          Adjust your active query filter criteria or ingest a new document.
        </span>
      </div>
    );
  }

  // Map event types to LED dot indicator colors
  const getEventDotStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "pricing change": return "led-blue shadow-[0_0_10px_#00e5ff]";
      case "product launch": return "led-green shadow-[0_0_10px_#00ff88]";
      case "feature release": return "led-purple shadow-[0_0_10px_#bf55ec]";
      case "funding": return "led-amber shadow-[0_0_10px_#ffb900]";
      case "strategy change": return "led-rose shadow-[0_0_10px_#ff007f]";
      default: return "bg-slate-400 shadow-[0_0_6px_#94a3b8]";
    }
  };

  return (
    <div className="relative">
      
      {/* Central Timeline Vertical Spine */}
      <div className="absolute left-4 md:left-8 top-2 bottom-2 w-0.5 bg-gradient-to-b from-cyber-blue/60 via-cyber-purple/40 to-cyber-green/10" />

      {/* Timeline Iterations */}
      <div className="space-y-8">
        {events.map((event, idx) => (
          <div key={event.id} className="relative flex pl-12 md:pl-20 transition-all duration-300">
            
            {/* Chronological LED node dot on the vertical spine */}
            <div className="absolute left-2 md:left-6 top-5 z-10 flex items-center justify-center">
              <span className={`w-4 h-4 rounded-full border-2 border-background flex items-center justify-center bg-background shadow-md`}>
                <span className={`w-2 h-2 rounded-full ${getEventDotStyle(event.event_type)}`} />
              </span>
            </div>

            {/* Pivot Connection Line Badge Ticker */}
            <div className="absolute left-8 md:left-14 top-[24px] hidden md:block w-6 border-t border-dashed border-cyber-border-glow select-none" />

            {/* Strategic Card Wrapper */}
            <div className="w-full flex-1">
              <EventCard event={event} highlightCompany={highlightCompany} />
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
