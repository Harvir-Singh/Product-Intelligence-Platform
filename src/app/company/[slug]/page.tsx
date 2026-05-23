'use client';

export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Activity, 
  ArrowLeft, 
  Layers, 
  TrendingUp, 
  ArrowUpRight, 
  FileText,
  Clock,
  Zap,
  DollarSign,
  Target
} from 'lucide-react';
import Timeline from '../../components/Timeline';
import type { ProductEvent, Company } from '@/lib/types';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function CompanyTimelinePage({ params }: PageProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [events, setEvents] = useState<ProductEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchCompanyData() {
      setLoading(true);
      try {
        const slug = params.slug.toLowerCase();
        
        // Fetch company profile list to search for exact slug
        const resComp = await fetch('/api/companies');
        const resEvents = await fetch(`/api/events?slug=${slug}`);

        if (resComp.ok && resEvents.ok) {
          const compData = await resComp.json();
          const eventData = await resEvents.json();

          const matchedCompany = compData.companies?.find((c: any) => c.slug === slug);
          
          if (matchedCompany) {
            setCompany(matchedCompany);
            setEvents(eventData.events || []);
          } else {
            setNotFound(true);
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Company details fetch failed:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanyData();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="py-32 text-center text-xs font-mono text-cyber-text animate-pulse uppercase tracking-widest">
        COMPILING ENTITY TIMELINE LEDGER... VERIFYING HASH PATHS...
      </div>
    );
  }

  if (notFound || !company) {
    return (
      <div className="terminal-panel border border-dashed border-cyber-border rounded-lg p-16 text-center max-w-lg mx-auto bg-background-card/40 my-10">
        <Building2 className="w-10 h-10 text-cyber-rose/60 mx-auto mb-3 animate-pulse" />
        <span className="block font-mono text-sm text-cyber-rose uppercase tracking-widest font-bold">
          Company Node Not Found
        </span>
        <p className="text-xs text-cyber-text/70 mt-2 leading-relaxed">
          The requested company slug <code className="bg-background-input border border-cyber-border px-1.5 py-0.5 rounded font-mono text-slate-100">{params.slug}</code> does not exist in our structured ledger.
        </p>
        <Link 
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 border border-cyber-border hover:border-cyber-blue text-xs font-mono rounded text-slate-200 transition-all hover:bg-background-panel"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO DASHBOARD</span>
        </Link>
      </div>
    );
  }

  // Calculate chronological evolution metrics
  const oldestEvent = events.length > 0 ? [...events].sort((a, b) => a.date.localeCompare(b.date))[0] : null;
  const latestEvent = events.length > 0 ? [...events].sort((a, b) => b.date.localeCompare(a.date))[0] : null;

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <div>
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cyber-text hover:text-cyber-blue transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK_TO_COMMAND_CENTER</span>
        </Link>
      </div>

      {/* Hero profile panel banner */}
      <div className="terminal-panel rounded border border-cyber-border bg-background-card/90 overflow-hidden flex flex-col md:flex-row items-center p-6 gap-6 transition-all duration-300">
        
        {/* Logo badge */}
        <div className="w-16 h-16 rounded bg-[#1f2538] flex items-center justify-center border border-cyber-border text-2xl font-bold font-mono text-slate-100 shrink-0">
          {company.name.substring(0, 1)}
        </div>

        {/* Profile Details */}
        <div className="space-y-1 text-center md:text-left flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-sans font-black tracking-tight text-slate-100">
            {company.name.toUpperCase()} <span className="text-cyber-green font-light font-mono text-xs ml-2">// TIMELINE HISTORY</span>
          </h1>
          <p className="text-xs text-cyber-text font-mono uppercase tracking-wider">
            Current taxonomy class: <span className="text-[#bf55ec]">{company.current_product_type}</span>
          </p>
          <p className="text-sm text-slate-300 font-sans leading-relaxed max-w-2xl mt-2">
            {company.description}
          </p>
        </div>

        {/* Aggregate Mini-stats right panel */}
        <div className="shrink-0 flex flex-row md:flex-col gap-4 border-t md:border-t-0 md:border-l border-cyber-border/60 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-around">
          <div className="text-center md:text-left">
            <span className="block text-[10px] font-mono text-cyber-text uppercase tracking-widest">Total Pivots</span>
            <span className="text-xl font-mono font-bold text-cyber-blue glow-text-blue">{events.length}</span>
          </div>
          <div className="text-center md:text-left">
            <span className="block text-[10px] font-mono text-cyber-text uppercase tracking-widest">First Pivot</span>
            <span className="text-sm font-mono text-slate-300">{oldestEvent ? oldestEvent.date : 'N/A'}</span>
          </div>
          <div className="text-center md:text-left">
            <span className="block text-[10px] font-mono text-cyber-text uppercase tracking-widest">Latest Pivot</span>
            <span className="text-sm font-mono text-slate-300">{latestEvent ? latestEvent.date : 'N/A'}</span>
          </div>
        </div>

      </div>

      {/* Double Column: Left (Timeline Stream) vs Right (Strategy Shifts Evolution Analyzer) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Vertical Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-cyber-border pb-2 px-1">
            <Clock className="w-4 h-4 text-cyber-blue animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest">
              Chronological Pivot Log
            </span>
          </div>

          <Timeline events={events} highlightCompany={false} />
        </div>

        {/* Right Column: Dynamic Strategy Shifts Evolution Analyzer */}
        <div className="space-y-6">
          <div className="terminal-panel rounded border border-cyber-border p-4 bg-background-card/90 space-y-4">
            
            <div className="terminal-header -mx-4 -mt-4 border-b border-cyber-border py-2 px-4 bg-[#0d1017]">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyber-green animate-pulse" />
                <span>Strategy Shift Vector</span>
              </span>
            </div>

            {events.length < 2 ? (
              <div className="text-center py-6 font-mono text-[11px] text-cyber-text">
                <span className="block uppercase font-bold text-cyber-amber">Analysis Gated</span>
                <span className="block mt-1 leading-relaxed">
                  We need at least two chronological pivot events to plot the strategy evolution curve over time.
                </span>
              </div>
            ) : oldestEvent && latestEvent ? (
              <div className="space-y-4 text-xs font-sans">
                <span className="block font-mono text-[10px] text-cyber-text uppercase tracking-widest mb-1">
                  How {company.name} has evolved from {oldestEvent.date} to {latestEvent.date}:
                </span>

                {/* Product core shift */}
                <div className="space-y-2 border-b border-cyber-border/40 pb-3">
                  <div className="flex items-center gap-1 text-[#bf55ec] font-semibold">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="font-mono text-[9px] uppercase tracking-wider">Product core shift</span>
                  </div>
                  <div className="space-y-1.5 pl-3 border-l border-[#bf55ec]/20 leading-relaxed text-slate-300">
                    <div>
                      <span className="text-cyber-text font-mono text-[9px] uppercase">[Origin]:</span>{" "}
                      {oldestEvent.strategic_insights.product_strategy}
                    </div>
                    <div className="pt-1">
                      <span className="text-cyber-green font-mono text-[9px] uppercase">[Latest]:</span>{" "}
                      {latestEvent.strategic_insights.product_strategy}
                    </div>
                  </div>
                </div>

                {/* Monetization shift */}
                <div className="space-y-2 border-b border-cyber-border/40 pb-3">
                  <div className="flex items-center gap-1 text-cyber-green font-semibold">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span className="font-mono text-[9px] uppercase tracking-wider">Monetization Shift</span>
                  </div>
                  <div className="space-y-1.5 pl-3 border-l border-cyber-green/20 leading-relaxed text-slate-300">
                    <div>
                      <span className="text-cyber-text font-mono text-[9px] uppercase">[Origin]:</span>{" "}
                      {oldestEvent.strategic_insights.monetization_strategy}
                    </div>
                    <div className="pt-1">
                      <span className="text-cyber-green font-mono text-[9px] uppercase">[Latest]:</span>{" "}
                      {latestEvent.strategic_insights.monetization_strategy}
                    </div>
                  </div>
                </div>

                {/* Target segment shift */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-cyber-amber font-semibold">
                    <Target className="w-3.5 h-3.5" />
                    <span className="font-mono text-[9px] uppercase tracking-wider">Target Segment Shift</span>
                  </div>
                  <div className="space-y-1.5 pl-3 border-l border-cyber-amber/20 leading-relaxed text-slate-300">
                    <div>
                      <span className="text-cyber-text font-mono text-[9px] uppercase">[Origin]:</span>{" "}
                      {oldestEvent.strategic_insights.target_segment}
                    </div>
                    <div className="pt-1">
                      <span className="text-cyber-green font-mono text-[9px] uppercase">[Latest]:</span>{" "}
                      {latestEvent.strategic_insights.target_segment}
                    </div>
                  </div>
                </div>

              </div>
            ) : null}

          </div>
        </div>

      </div>

    </div>
  );
}
