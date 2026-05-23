'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Tag, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  DollarSign, 
  Compass, 
  Zap, 
  Users,
  Building,
  Target
} from 'lucide-react';
import type { ProductEvent } from '@/lib/types';

interface EventCardProps {
  event: ProductEvent;
  highlightCompany?: boolean;
}

export default function EventCard({ event, highlightCompany = true }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Map product type to corresponding border & text styles
  const getProductTypeStyle = (type: string) => {
    switch (type) {
      case "AI Product": return "border-cyber-green text-cyber-green bg-cyber-green/5";
      case "Fintech": return "border-cyber-blue text-cyber-blue bg-cyber-blue/5";
      case "Developer Tool": return "border-cyber-purple text-cyber-purple bg-cyber-purple/5";
      case "B2B SaaS": return "border-cyber-amber text-cyber-amber bg-cyber-amber/5";
      case "Platform Ecosystem": return "border-cyber-rose text-cyber-rose bg-cyber-rose/5";
      default: return "border-cyber-text text-cyber-text bg-background-input";
    }
  };

  // Map confidence score to color codes
  const getConfidenceColor = (score: number) => {
    if (score >= 85) return 'text-cyber-green shadow-[0_0_8px_#00ff88]';
    if (score >= 70) return 'text-cyber-amber shadow-[0_0_8px_#ffb900]';
    return 'text-cyber-rose shadow-[0_0_8px_#ff007f]';
  };

  return (
    <div className="terminal-panel overflow-hidden border border-cyber-border rounded-lg bg-background-card/90 flex flex-col transition-all duration-300 hover:border-cyber-border-glow">
      
      {/* Card Header Banner */}
      <div className="terminal-header shrink-0 flex items-center justify-between py-3 px-4 border-b border-cyber-border bg-[#0d1017]">
        <div className="flex items-center gap-3 min-w-0">
          
          {/* Company Badge Link */}
          {highlightCompany ? (
            <Link 
              href={`/company/${event.slug}`} 
              className="flex items-center gap-2 hover:underline shrink-0 group"
            >
              <div className="w-6 h-6 rounded bg-[#1f2538] flex items-center justify-center border border-cyber-border text-xs font-bold font-mono text-slate-100 group-hover:border-cyber-green">
                {event.company_name.substring(0, 1)}
              </div>
              <span className="font-sans font-bold text-sm tracking-wide text-slate-200 group-hover:text-cyber-green">
                {event.company_name}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded bg-[#1f2538] flex items-center justify-center border border-cyber-border text-xs font-bold font-mono text-slate-100">
                {event.company_name.substring(0, 1)}
              </div>
              <span className="font-sans font-bold text-sm tracking-wide text-slate-200">
                {event.company_name}
              </span>
            </div>
          )}

          <span className="text-cyber-border select-none">|</span>

          {/* Product Type pill */}
          <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${getProductTypeStyle(event.product_type)} truncate max-w-[120px] md:max-w-none`}>
            {event.product_type}
          </span>
        </div>

        {/* Date Ticker */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyber-text">
          <Calendar className="w-3.5 h-3.5" />
          <span>{event.date}</span>
        </div>
      </div>

      {/* Main Core Body */}
      <div className="p-4 space-y-4 flex-1">
        
        {/* Event Type Ticker Indicator */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono bg-background-input border border-cyber-border px-2 py-0.5 rounded text-cyber-blue uppercase tracking-wider font-semibold">
            {event.event_type}
          </span>
          
          {/* Confidence Indicator */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-cyber-text">AI CONFIDENCE:</span>
            <span className={`text-xs font-mono font-bold ${getConfidenceColor(event.confidence_score)}`}>
              {event.confidence_score}%
            </span>
          </div>
        </div>

        {/* Summary Description block */}
        <p className="text-sm text-slate-200 font-sans leading-relaxed">
          {event.summary}
        </p>

        {/* Strategy Badges Tag Section */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {event.tags.map((tag) => (
            <span 
              key={tag} 
              className="text-[10px] font-mono bg-[#161a29] border border-cyber-border text-slate-400 px-2 py-0.5 rounded flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5 opacity-60 text-cyber-blue" />
              <span>{tag}</span>
            </span>
          ))}
        </div>

        {/* Dynamic Strategy Insights Grid (Collapsible Drawer Accordion) */}
        <div className="border-t border-cyber-border pt-4">
          <button 
            type="button"
            onClick={() => setCollapsedOpen(!expanded)}
            className="w-full flex items-center justify-between text-xs font-mono text-cyber-text hover:text-slate-200 transition-colors py-1 focus:outline-none"
          >
            <span className="font-semibold tracking-wider uppercase">Strategic Pivot Deep-Dive</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <div className={`transition-all duration-300 overflow-hidden ${
            expanded ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0 pointer-events-none'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background-panel/40 border border-cyber-border p-4 rounded text-xs font-sans">
              
              {/* Product Strategy channel */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyber-purple font-semibold">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px] uppercase tracking-wider">Product Core Strategy</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-5 border-l border-cyber-purple/20">
                  {event.strategic_insights.product_strategy}
                </p>
              </div>

              {/* Monetization Strategy channel */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyber-green font-semibold">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px] uppercase tracking-wider">Monetization & unit-economics</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-5 border-l border-cyber-green/20">
                  {event.strategic_insights.monetization_strategy}
                </p>
              </div>

              {/* Growth Distribution channel */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyber-blue font-semibold">
                  <Compass className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px] uppercase tracking-wider">Growth & Distribution</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-5 border-l border-cyber-blue/20">
                  {event.strategic_insights.growth_strategy}
                </p>
              </div>

              {/* Target Segment channel */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyber-amber font-semibold">
                  <Target className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px] uppercase tracking-wider">Target Customer Segment</span>
                </div>
                <p className="text-slate-300 leading-relaxed pl-5 border-l border-cyber-amber/20">
                  {event.strategic_insights.target_segment}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Card Footer Document source details */}
      <div className="py-2.5 px-4 bg-[#0a0c12]/80 border-t border-cyber-border/80 shrink-0 flex items-center justify-between text-[11px] font-mono text-cyber-text">
        <span className="truncate max-w-[200px] md:max-w-sm">Source: {event.source_url}</span>
        {event.source_url.startsWith('http') ? (
          <a 
            href={event.source_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1 hover:text-cyber-green hover:underline cursor-pointer"
          >
            <span>DOCS</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-[10px] text-cyber-text/60">LEDGER BLOCK</span>
        )}
      </div>

    </div>
  );

  // local setter helper due to JSX/State overlap
  function setCollapsedOpen(state: boolean) {
    setExpanded(state);
  }
}
