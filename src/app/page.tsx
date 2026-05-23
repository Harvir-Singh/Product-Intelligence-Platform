'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Terminal, 
  TrendingUp, 
  Layers, 
  Cpu, 
  CheckSquare, 
  Info,
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import MetricCard from './components/MetricCard';
import Timeline from './components/Timeline';
import type { ProductEvent } from '@/lib/types';

export default function HomeFeed() {
  const [events, setEvents] = useState<ProductEvent[]>([]);
  const [companyCount, setCompanyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Fetch events on mount and when filter changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch events with active tag filter if set
        const url = activeTag ? `/api/events?tags=${activeTag}` : '/api/events';
        const resEvents = await fetch(url);
        
        // Fetch company count
        const resCompanies = await fetch('/api/companies');

        if (resEvents.ok && resCompanies.ok) {
          const dataEvents = await resEvents.json();
          const dataCompanies = await resCompanies.json();
          
          setEvents(dataEvents.events || []);
          setCompanyCount(dataCompanies.companies?.length || 0);
        }
      } catch (err) {
        console.error("Home feed fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [activeTag]);

  // Compute metric aggregates
  const totalEvents = events.length;
  const avgConfidence = totalEvents > 0 
    ? Math.round(events.reduce((sum, e) => sum + e.confidence_score, 0) / totalEvents) 
    : 0;

  // Identify most frequent product type
  const productTypeCounts: Record<string, number> = {};
  events.forEach(e => {
    productTypeCounts[e.product_type] = (productTypeCounts[e.product_type] || 0) + 1;
  });
  const topProductType = Object.keys(productTypeCounts).length > 0
    ? Object.entries(productTypeCounts).sort((a, b) => b[1] - a[1])[0][0]
    : 'B2B SaaS';

  const hotTags = ["pricing-change", "product-launch", "openai", "stripe", "developer-experience", "artificial-intelligence"];

  return (
    <div className="space-y-6">
      
      {/* Hero section Command Center banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-sans font-black tracking-tight text-slate-100 flex items-center gap-2">
            <Terminal className="w-6 h-6 text-cyber-blue" />
            <span>PRODUCT INTEL ENGINE <span className="text-cyber-blue font-light">//</span> COMMAND CENTER</span>
          </h1>
          <p className="text-xs text-cyber-text font-mono mt-1">
            CONTINUOUSLY TRACKING, STRUCTURING, AND ANALYZING GLOBAL TECHNOLOGY AND SAAS STRATEGY SHIFTS.
          </p>
        </div>
      </div>

      {/* Telemetry metrics row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Product Ledger pivots" 
          value={loading ? "..." : totalEvents} 
          description="Chronological strategic records"
          icon={TrendingUp}
          color="blue"
          trend="+18% Pivot Rate"
          trendDirection="up"
        />
        <MetricCard 
          title="Tracked Tech Nodes" 
          value={loading ? "..." : companyCount} 
          description="Monitored core ecosystems"
          icon={Layers}
          color="purple"
          trend="Active Ledgers"
          trendDirection="neutral"
        />
        <MetricCard 
          title="Leading Product Sector" 
          value={loading ? "..." : topProductType} 
          description="Sector exhibiting maximum pivot rates"
          icon={Cpu}
          color="amber"
          trend="High Volatility"
          trendDirection="up"
        />
        <MetricCard 
          title="Avg Parser Confidence" 
          value={loading ? "..." : `${avgConfidence}%`} 
          description="AI classification alignment rating"
          icon={ShieldCheck}
          color="green"
          trend="Validated RAG"
          trendDirection="up"
        />
      </div>

      {/* Double Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Double-Wide Panel: Ledger Timeline Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border pb-2.5">
            <span className="text-xs font-mono font-bold text-slate-200 tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyber-blue animate-pulse" />
              <span>Real-Time Strategic Timeline</span>
            </span>

            {/* Quick hot tag pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveTag(null)}
                className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all ${
                  !activeTag 
                    ? 'border-cyber-blue text-cyber-blue bg-cyber-blue/5' 
                    : 'border-cyber-border text-cyber-text hover:text-slate-200 hover:border-slate-400'
                }`}
              >
                ALL
              </button>
              {hotTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all uppercase ${
                    activeTag === tag 
                      ? 'border-cyber-blue text-cyber-blue bg-cyber-blue/5' 
                      : 'border-cyber-border text-cyber-text hover:text-slate-200 hover:border-slate-400'
                  }`}
                >
                  {tag.replace(/-+/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs font-mono text-cyber-text animate-pulse">
              LOADING SYSTEM LEDGER TIMELINES...
            </div>
          ) : (
            <Timeline events={events} />
          )}
        </div>

        {/* Right Single Panel: Macro Strategic Advisories */}
        <div className="space-y-6">
          
          {/* Macro Advisories box */}
          <div className="terminal-panel rounded border border-cyber-border p-4 bg-background-card/90 space-y-4">
            <div className="terminal-header -mx-4 -mt-4 border-b border-cyber-border py-2 px-4 bg-[#0d1017]">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#ffb900] animate-pulse" />
                <span>Macro Strategic Advisories</span>
              </span>
            </div>

            <div className="space-y-4 font-sans text-xs">
              
              {/* Trend 1 */}
              <div className="space-y-1.5 border-b border-cyber-border pb-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#bf55ec] uppercase font-bold tracking-wider">
                    Trend 01: Token Monetization
                  </span>
                  <span className="text-[9px] font-mono bg-cyber-green/15 text-cyber-green px-1 rounded font-bold">
                    HIGH VOLATILITY
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Leading AI providers are moving aggressively from fixed SaaS model seats to API volume pricing. Rapid margin degradation from compute overhead is driving gate systems locking premium features.
                </p>
                <div className="text-[10px] font-mono text-cyber-text">
                  Sector Impact: <span className="text-slate-300">AI Product, Infrastructure</span>
                </div>
              </div>

              {/* Trend 2 */}
              <div className="space-y-1.5 border-b border-cyber-border pb-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-cyber-blue uppercase font-bold tracking-wider">
                    Trend 02: Platform Decoupling
                  </span>
                  <span className="text-[9px] font-mono bg-background-input border border-cyber-border text-cyber-text px-1 rounded">
                    STABLE MOVEMENT
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Stripe's decoupling of billing from payment rails highlights an industry shift toward modular financial stacks. Unbundling enables enterprise penetration of Point-of-Sale (POS) pipelines.
                </p>
                <div className="text-[10px] font-mono text-cyber-text">
                  Sector Impact: <span className="text-slate-300">Fintech, B2B SaaS</span>
                </div>
              </div>

              {/* Trend 3 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-cyber-amber uppercase font-bold tracking-wider">
                    Trend 03: Localized AI Chips
                  </span>
                  <span className="text-[9px] font-mono bg-cyber-rose/15 text-cyber-rose px-1 rounded font-bold">
                    STRATEGIC PIVOT
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Apple Intelligence gating on-device models to high-memory chips represents a hardware super-cycle distribution trigger. This blocks pure software AI points from consumer operating pipelines.
                </p>
                <div className="text-[10px] font-mono text-cyber-text">
                  Sector Impact: <span className="text-slate-300">Platform Ecosystem, Hardware</span>
                </div>
              </div>

            </div>
          </div>

          {/* Quick-Stats Table System Index */}
          <div className="terminal-panel rounded border border-cyber-border p-4 bg-background-card/90 space-y-3 font-mono text-xs">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
              <span>System Index Health</span>
            </span>
            
            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between border-b border-cyber-border/40 pb-1">
                <span className="text-cyber-text">LEDGER_LEDGER:</span>
                <span className="text-cyber-green font-bold">SECURE (D1 SCHEMA)</span>
              </div>
              <div className="flex justify-between border-b border-cyber-border/40 pb-1">
                <span className="text-cyber-text">VECTOR_SPACE:</span>
                <span className="text-cyber-green font-bold">ACTIVE (COSINE_1536)</span>
              </div>
              <div className="flex justify-between border-b border-cyber-border/40 pb-1">
                <span className="text-cyber-text">AUTO_INDEXING:</span>
                <span className="text-cyber-blue font-bold">ENABLED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-text">LEDGER_DATA_STORE:</span>
                <span className="text-slate-300">/src/lib/data-store.json</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
