'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ArrowLeftRight, 
  HelpCircle, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Target, 
  Info,
  CheckCircle2
} from 'lucide-react';

interface CompanyAggregate {
  name: string;
  slug: string;
  logo_url: string;
  current_product_type: string;
  description: string;
  event_count: number;
}

export default function InsightsDashboard() {
  const [companies, setCompanies] = useState<CompanyAggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [compA, setCompA] = useState('');
  const [compB, setCompB] = useState('');
  const [strategyDataA, setStrategyDataA] = useState<any>(null);
  const [strategyDataB, setStrategyDataB] = useState<any>(null);

  // Fetch tracked companies list
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch('/api/companies');
        if (res.ok) {
          const data = await res.json();
          setCompanies(data.companies || []);
          
          // Pre-select Stripe vs OpenAI if available
          if (data.companies && data.companies.length >= 2) {
            setCompA(data.companies.find((c: any) => c.slug === 'stripe')?.name || data.companies[0].name);
            setCompB(data.companies.find((c: any) => c.slug === 'openai')?.name || data.companies[1].name);
          }
        }
      } catch (err) {
        console.error("Insights companies load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  // Fetch strategic summaries when selections shift
  useEffect(() => {
    async function fetchStrategies() {
      if (!compA) return;
      try {
        const slug = compA.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const res = await fetch(`/api/events?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          // Take the latest event as representing current strategy
          const latest = data.events?.sort((a: any, b: any) => b.date.localeCompare(a.date))[0];
          setStrategyDataA(latest || null);
        }
      } catch (err) {
        console.error("Strategy A load failed:", err);
      }
    }
    fetchStrategies();
  }, [compA]);

  useEffect(() => {
    async function fetchStrategies() {
      if (!compB) return;
      try {
        const slug = compB.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const res = await fetch(`/api/events?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          // Take the latest event as representing current strategy
          const latest = data.events?.sort((a: any, b: any) => b.date.localeCompare(a.date))[0];
          setStrategyDataB(latest || null);
        }
      } catch (err) {
        console.error("Strategy B load failed:", err);
      }
    }
    fetchStrategies();
  }, [compB]);

  // Synthesis engine for macro analyst comparison insights card
  const getStrategicAnalysisSummary = () => {
    if (!compA || !compB || compA === compB) {
      return "Select two separate tracked nodes to compile custom strategic comparisons.";
    }

    const typeA = strategyDataA?.product_type || "SaaS";
    const typeB = strategyDataB?.product_type || "SaaS";

    let brief = `Comparing **${compA}** (${typeA}) and **${compB}** (${typeB}) reveals fundamentally distinct distribution and monetization designs:\n\n`;

    if (compA === 'Stripe' && compB === 'OpenAI') {
      brief += `- **Monetization Mechanics**: Stripe relies on *transaction-based percentages* + unbundled SaaS billing engines to drive NRR. In contrast, OpenAI utilizes a *hybrid token usage rate* (API calls) + flat premium seat memberships ($20/month) to offset massive raw compute workloads.\n`;
      brief += `- **Distribution Curves**: Stripe utilizes bottom-up developer sandbox virality but deploys decoupling strategies to capture enterprise legacy processors. OpenAI relies on consumer virality (ChatGPT) and rapid pricing reduction cycles to starve open-source alternatives.\n`;
      brief += `- **Platform Lock-in**: Stripe gates on operational switching costs (moving payment histories). OpenAI gates on cognitive platform dependency (embeddings and custom GPT agents).`;
    } else if (compA === 'Notion' && compB === 'OpenAI') {
      brief += `- **Monetization Mechanics**: Notion focuses on *workspace bundling* and high-margin recurring seat plans, leveraging AI as a high-velocity add-on ($10/user/month). OpenAI monetizes raw intelligence access via *token consumption vectors*.\n`;
      brief += `- **Integration Strategies**: Notion builds point-utility stickiness by infusing AI directly inside the workspace canvas where user document databases reside. OpenAI acts as a decentralized raw infrastructure layer waiting for third-party client integrations.\n`;
      brief += `- **Target Segments**: Notion captures collaborative operational SMB groups and product managers. OpenAI captures developers and high-volume data architects.`;
    } else {
      brief += `- **Entity A (${compA})**: Focuses heavily on *${strategyDataA?.strategic_insights.target_segment || 'General technology buyers'}*. Its product strategy prioritizes *${strategyDataA?.strategic_insights.product_strategy || 'enhancing user experience'}*.\n`;
      brief += `- **Entity B (${compB})**: Tailors services for *${strategyDataB?.strategic_insights.target_segment || 'Enterprise builders'}*. Its product core targets *${strategyDataB?.strategic_insights.product_strategy || 'scalability and integrations'}*.\n`;
      brief += `- **Key Strategic Variance**: The monetization models highlight a transition from pure point-solution billing into integrated platform value extraction.`;
    }

    return brief;
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="border-b border-cyber-border pb-4">
        <h1 className="text-xl md:text-2xl font-sans font-black tracking-tight text-slate-100 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-cyber-blue" />
          <span>STRATEGIC COMPARISON MATRIX <span className="text-cyber-blue font-light">//</span> ANOMALY ANALYSIS</span>
        </h1>
        <p className="text-xs text-cyber-text font-mono mt-1">
          PLOT BUSINESS MODEL SHIFTS, PRICING STRUCTURES, AND DISTRIBUTION VECTORS IN SIDE-BY-SIDE ANALYSES.
        </p>
      </div>

      {/* Select Control Board */}
      <div className="terminal-panel rounded border border-cyber-border p-4 bg-background-card/85 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Dropdown Company A */}
        <div className="w-full sm:w-5/12">
          <label className="block text-[10px] font-mono text-cyber-text uppercase tracking-wider mb-1.5">
            Select Base Target Node [A]
          </label>
          <select
            value={compA}
            onChange={(e) => setCompA(e.target.value)}
            className="w-full bg-background-input border border-cyber-border text-xs px-2.5 py-2.5 rounded font-mono text-slate-200 focus:outline-none hover:border-cyber-blue transition-colors cursor-pointer"
          >
            {companies.map(c => (
              <option key={c.slug} value={c.name}>{c.name.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Dynamic Vector Connector Icon */}
        <div className="shrink-0 bg-background-input p-2.5 rounded-full border border-cyber-border">
          <ArrowLeftRight className="w-4 h-4 text-cyber-blue animate-pulse" />
        </div>

        {/* Dropdown Company B */}
        <div className="w-full sm:w-5/12">
          <label className="block text-[10px] font-mono text-cyber-text uppercase tracking-wider mb-1.5">
            Select Comparison Target Node [B]
          </label>
          <select
            value={compB}
            onChange={(e) => setCompB(e.target.value)}
            className="w-full bg-background-input border border-cyber-border text-xs px-2.5 py-2.5 rounded font-mono text-slate-200 focus:outline-none hover:border-cyber-blue transition-colors cursor-pointer"
          >
            {companies.map(c => (
              <option key={c.slug} value={c.name}>{c.name.toUpperCase()}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Strategy Comparison Matrix Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs font-mono text-cyber-text animate-pulse">
          COMPILING STRATEGIC COMPARISON DUAL MATRIX DATA...
        </div>
      ) : (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Columns A */}
            <div className="terminal-panel rounded border border-cyber-border p-5 bg-background-card/90 space-y-4">
              <div className="flex items-center gap-3 border-b border-cyber-border pb-3">
                <div className="w-8 h-8 rounded bg-[#1f2538] flex items-center justify-center border border-cyber-border text-sm font-bold font-mono text-slate-100">
                  {compA.substring(0, 1)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">{compA.toUpperCase()}</h2>
                  <span className="text-[10px] font-mono text-cyber-blue uppercase font-bold">{strategyDataA?.product_type || 'B2B SaaS'}</span>
                </div>
              </div>

              {strategyDataA ? (
                <div className="space-y-4 text-xs font-sans">
                  
                  {/* Product strategy */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-cyber-purple font-semibold">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold">Product Strategy</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5 border-l border-cyber-purple/20">
                      {strategyDataA.strategic_insights.product_strategy}
                    </p>
                  </div>

                  {/* Monetization strategy */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-cyber-green font-semibold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold">Monetization & Pricing</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5 border-l border-cyber-green/20">
                      {strategyDataA.strategic_insights.monetization_strategy}
                    </p>
                  </div>

                  {/* Growth strategy */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-cyber-blue font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold">Growth & Distribution</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5 border-l border-cyber-blue/20">
                      {strategyDataA.strategic_insights.growth_strategy}
                    </p>
                  </div>

                  {/* Target segment */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-cyber-amber font-semibold">
                      <Target className="w-3.5 h-3.5" />
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold">Target Segment</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5 border-l border-cyber-amber/20">
                      {strategyDataA.strategic_insights.target_segment}
                    </p>
                  </div>

                </div>
              ) : (
                <div className="text-center py-10 font-mono text-[10px] text-cyber-text">
                  NO PIVOT STRATEGY DATA POPULATED FOR NODE A.
                </div>
              )}
            </div>

            {/* Columns B */}
            <div className="terminal-panel rounded border border-cyber-border p-5 bg-background-card/90 space-y-4">
              <div className="flex items-center gap-3 border-b border-cyber-border pb-3">
                <div className="w-8 h-8 rounded bg-[#1f2538] flex items-center justify-center border border-cyber-border text-sm font-bold font-mono text-slate-100">
                  {compB.substring(0, 1)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">{compB.toUpperCase()}</h2>
                  <span className="text-[10px] font-mono text-cyber-blue uppercase font-bold">{strategyDataB?.product_type || 'B2B SaaS'}</span>
                </div>
              </div>

              {strategyDataB ? (
                <div className="space-y-4 text-xs font-sans">
                  
                  {/* Product strategy */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-cyber-purple font-semibold">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold">Product Strategy</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5 border-l border-cyber-purple/20">
                      {strategyDataB.strategic_insights.product_strategy}
                    </p>
                  </div>

                  {/* Monetization strategy */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-cyber-green font-semibold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold">Monetization & Pricing</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5 border-l border-cyber-green/20">
                      {strategyDataB.strategic_insights.monetization_strategy}
                    </p>
                  </div>

                  {/* Growth strategy */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-cyber-blue font-semibold">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold">Growth & Distribution</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5 border-l border-cyber-blue/20">
                      {strategyDataB.strategic_insights.growth_strategy}
                    </p>
                  </div>

                  {/* Target segment */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-cyber-amber font-semibold">
                      <Target className="w-3.5 h-3.5" />
                      <span className="font-mono text-[9px] uppercase tracking-wider font-bold">Target Segment</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed pl-5 border-l border-cyber-amber/20">
                      {strategyDataB.strategic_insights.target_segment}
                    </p>
                  </div>

                </div>
              ) : (
                <div className="text-center py-10 font-mono text-[10px] text-cyber-text">
                  NO PIVOT STRATEGY DATA POPULATED FOR NODE B.
                </div>
              )}
            </div>

          </div>

          {/* Macro Analyst Comparison Synthesis Card */}
          <div className="terminal-panel rounded border border-cyber-border p-5 bg-[#090c13] space-y-4">
            
            <div className="terminal-header -mx-5 -mt-5 border-b border-cyber-border py-2.5 px-4 bg-[#0d1017]">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyber-blue animate-pulse" />
                <span>Macro Strategic Synthesis Advisory</span>
              </span>
            </div>

            <div className="space-y-2 pl-4 border-l border-cyber-blue/40">
              <div className="text-xs text-slate-300 leading-relaxed space-y-3 font-sans">
                {getStrategicAnalysisSummary().split('\n\n').map((para, pIdx) => {
                  return (
                    <div key={pIdx}>
                      {para.split('\n').map((line, lIdx) => {
                        if (line.startsWith('- ')) {
                          const rest = line.substring(2);
                          const boldParts = rest.split(/(\*\*.*?\*\*)/g);
                          return (
                            <li key={lIdx} className="list-disc ml-4 my-1.5 leading-relaxed text-slate-300">
                              {boldParts.map((part, i) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={i} className="text-slate-100 font-bold">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                              })}
                            </li>
                          );
                        }
                        const boldParts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                          <p key={lIdx} className="leading-relaxed">
                            {boldParts.map((part, i) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={i} className="text-slate-100 font-extrabold glow-text-blue">{part.slice(2, -2)}</strong>;
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>

        </div>
      )}

    </div>
  );
}
