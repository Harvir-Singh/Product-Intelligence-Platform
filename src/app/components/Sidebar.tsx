'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Database, 
  Terminal, 
  Compass, 
  Sliders, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Cpu, 
  Building2, 
  Layers
} from 'lucide-react';

interface Company {
  name: string;
  slug: string;
  logo_url: string;
  current_product_type: string;
  event_count: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch company lists for sidebar ticker
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch('/api/companies');
        if (res.ok) {
          const data = await res.json();
          setCompanies(data.companies || []);
        }
      } catch (err) {
        console.error("Sidebar company fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, [pathname]); // Refresh when page routing changes (e.g. new ingestion updates lists)

  // Map product type to corresponding LED indicator styles
  const getProductTypeLED = (type: string) => {
    switch (type) {
      case "AI Product": return "led-green";
      case "Fintech": return "led-blue";
      case "Developer Tool": return "led-purple";
      case "B2B SaaS": return "led-amber";
      case "Platform Ecosystem": return "led-rose";
      default: return "bg-slate-400 shadow-[0_0_8px_#94a3b8]";
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Terminal },
    { name: 'Explore Ledger', path: '/explore', icon: Compass },
    { name: 'Strategy Matrix', path: '/insights', icon: Sliders },
  ];

  return (
    <aside 
      className={`h-screen border-r border-cyber-border bg-[#0a0c14] flex flex-col text-slate-200 transition-all duration-300 z-40 shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar Header Brand */}
      <div className="terminal-header h-16 flex items-center justify-between border-b border-cyber-border px-4 shrink-0 bg-[#07090e]">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <Database className="w-5 h-5 text-cyber-green animate-pulse-slow" />
          {!collapsed && (
            <span className="title-font font-bold text-sm tracking-widest text-slate-100 glow-text-green uppercase whitespace-nowrap">
              PROD-INTEL <span className="text-cyber-green">OS</span>
            </span>
          )}
        </Link>
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-cyber-text hover:text-cyber-green p-1 rounded hover:bg-background-card transition-all"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 shrink-0 border-b border-cyber-border">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all group relative ${
                isActive 
                  ? 'bg-background-card border-l-2 border-cyber-blue text-cyber-blue glow-text-blue' 
                  : 'text-cyber-text hover:bg-[#121624] hover:text-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {!collapsed && <span>{item.name}</span>}
              
              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-14 bg-background-panel border border-cyber-border text-xs px-2.5 py-1.5 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Ticker Section - Dynamic Tracked Companies */}
      <div className="flex-1 flex flex-col min-h-0">
        {!collapsed && (
          <div className="px-4 py-3 flex items-center justify-between text-[11px] font-semibold text-cyber-text tracking-wider uppercase opacity-75">
            <span>Market Ledger</span>
            <Layers className="w-3.5 h-3.5 text-cyber-blue" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {loading ? (
            !collapsed && (
              <div className="text-[11px] text-cyber-text text-center py-4 font-mono">
                INITIALIZING...
              </div>
            )
          ) : (
            companies.map((c) => {
              const isActive = pathname === `/company/${c.slug}`;
              return (
                <Link 
                  key={c.slug}
                  href={`/company/${c.slug}`}
                  className={`flex items-center justify-between px-3 py-2 rounded text-xs transition-all group relative ${
                    isActive 
                      ? 'bg-background-card text-cyber-green' 
                      : 'text-cyber-text hover:bg-[#121624] hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {/* Led indicator */}
                    <span className={`led-dot ${getProductTypeLED(c.current_product_type)} shrink-0`} />
                    {!collapsed && (
                      <span className="font-mono truncate font-medium text-slate-300 group-hover:text-slate-100">
                        {c.name}
                      </span>
                    )}
                  </div>
                  
                  {!collapsed && (
                    <span className="text-[10px] font-mono bg-background-input border border-cyber-border px-1.5 py-0.5 rounded text-cyber-text opacity-70 group-hover:opacity-100 transition-opacity">
                      {c.event_count}
                    </span>
                  )}

                  {/* Tooltip for collapsed mode */}
                  {collapsed && (
                    <div className="absolute left-14 bg-background-panel border border-cyber-border text-xs px-2.5 py-1.5 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 whitespace-nowrap">
                      {c.name} ({c.current_product_type})
                    </div>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Sidebar Footer System Health */}
      <div className="p-3 shrink-0 bg-[#07090e] border-t border-cyber-border flex flex-col justify-center">
        {collapsed ? (
          <div className="flex justify-center">
            <span className="led-dot led-green animate-pulse" />
          </div>
        ) : (
          <div className="flex items-center justify-between text-[10px] font-mono text-cyber-text px-1">
            <div className="flex items-center gap-1.5">
              <span className="led-dot led-green animate-pulse" />
              <span className="glow-text-green text-cyber-green">SYS ACTIVE</span>
            </div>
            <span className="opacity-50">v0.10.CF</span>
          </div>
        )}
      </div>
    </aside>
  );
}
