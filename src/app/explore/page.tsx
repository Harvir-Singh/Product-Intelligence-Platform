'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Database, 
  Sparkles, 
  X,
  AlertCircle,
  HelpCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { PRODUCT_TYPES, EVENT_TYPES } from '@/lib/types';
import type { ProductEvent } from '@/lib/types';
import EventCard from '../components/EventCard';

export default function ExplorePage() {
  const [events, setEvents] = useState<ProductEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchVal, setSearchVal] = useState('');
  const [semanticVal, setSemanticVal] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  
  // Track unique companies in the ledger for filter dropdown
  const [companiesList, setCompaniesList] = useState<string[]>([]);

  // Fetch unique companies & initial events list
  useEffect(() => {
    async function fetchInitData() {
      try {
        const resComp = await fetch('/api/companies');
        if (resComp.ok) {
          const data = await resComp.json();
          setCompaniesList(data.companies?.map((c: any) => c.name) || []);
        }
      } catch (err) {
        console.error("Explore pre-fetch failed:", err);
      }
    }
    fetchInitData();
  }, []);

  // Fetch filtered events when variables change
  useEffect(() => {
    async function fetchFilteredEvents() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        if (selectedProduct) params.append('product_type', selectedProduct);
        if (selectedEvent) params.append('event_type', selectedEvent);
        if (selectedCompany) params.append('slug', selectedCompany.toLowerCase());
        if (searchVal.trim()) params.append('search_query', searchVal);
        
        // Semantic query override
        if (semanticVal.trim()) {
          params.append('q', semanticVal);
        }

        const res = await fetch(`/api/events?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error("Fetch filtered events failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFilteredEvents();
  }, [selectedProduct, selectedEvent, selectedCompany, searchVal, semanticVal]);

  const clearFilters = () => {
    setSelectedProduct('');
    setSelectedEvent('');
    setSelectedCompany('');
    setSearchVal('');
    setSemanticVal('');
  };

  const hasActiveFilters = selectedProduct || selectedEvent || selectedCompany || searchVal || semanticVal;

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="border-b border-cyber-border pb-4">
        <h1 className="text-xl md:text-2xl font-sans font-black tracking-tight text-slate-100 flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6 text-cyber-purple" />
          <span>STRATEGY EXPLORE LEDGER <span className="text-cyber-purple font-light">//</span> SEMANTIC SEARCH</span>
        </h1>
        <p className="text-xs text-cyber-text font-mono mt-1">
          EXECUTE SEMANTIC QUERIES ACROSS THE INSIGHTS EMBEDDING GRAPHS OR FILTER VIA KEYWORD TAXONOMIES.
        </p>
      </div>

      {/* Control Console (Filters & Semantic Input) */}
      <div className="terminal-panel rounded border border-cyber-border p-4 bg-background-card/85 space-y-4">
        
        {/* Row 1: Dual Search Interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Keyword Search Input */}
          <div className="relative">
            <label className="block text-[10px] font-mono text-cyber-text uppercase tracking-wider mb-1.5">
              Standard Keyword Index Search
            </label>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-cyber-text absolute left-3 pointer-events-none" />
              <input 
                type="text"
                placeholder="SEARCH WORDS, TEAMS, TAGS, SUMMARY..."
                value={searchVal}
                onChange={(e) => {
                  setSemanticVal(''); // Clear semantic when typing keyword
                  setSearchVal(e.target.value);
                }}
                className="w-full bg-background-input border border-cyber-border focus:border-cyber-blue text-xs pl-10 pr-4 py-3 rounded font-mono text-slate-200 focus:outline-none placeholder:text-cyber-text/50"
              />
              {searchVal && (
                <button 
                  onClick={() => setSearchVal('')}
                  className="absolute right-3 text-cyber-text hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* AI Semantic Vector Search Input */}
          <div className="relative">
            <label className="block text-[10px] font-mono text-cyber-purple uppercase tracking-wider mb-1.5 flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyber-purple animate-pulse" />
              <span>AI Vector Semantic Search (1536-Dim)</span>
            </label>
            <div className="relative flex items-center">
              <Sparkles className="w-4 h-4 text-cyber-purple absolute left-3 pointer-events-none" />
              <input 
                type="text"
                placeholder="COMPARE, SUMMARIZE, OR FIND (e.g. 'pricing models in B2B SaaS')"
                value={semanticVal}
                onChange={(e) => {
                  setSearchVal(''); // Clear keyword when typing semantic
                  setSemanticVal(e.target.value);
                }}
                className="w-full bg-background-input border border-cyber-purple/40 focus:border-cyber-purple text-xs pl-10 pr-4 py-3 rounded font-mono text-slate-200 focus:outline-none placeholder:text-cyber-purple/40"
              />
              {semanticVal && (
                <button 
                  onClick={() => setSemanticVal('')}
                  className="absolute right-3 text-cyber-text hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Row 2: Strict Taxonomy Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-cyber-border/50 pt-3.5">
          
          {/* Company filter */}
          <div>
            <label className="block text-[9px] font-mono text-cyber-text uppercase tracking-wider mb-1.5">
              Filter by Company
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full bg-background-input border border-cyber-border text-xs px-2.5 py-2 rounded font-mono text-slate-300 focus:outline-none hover:border-cyber-blue transition-colors cursor-pointer"
            >
              <option value="">[ALL TRAKED NODES]</option>
              {companiesList.map(c => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Product Type filter */}
          <div>
            <label className="block text-[9px] font-mono text-cyber-text uppercase tracking-wider mb-1.5">
              Filter by Product Class
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full bg-background-input border border-cyber-border text-xs px-2.5 py-2 rounded font-mono text-slate-300 focus:outline-none hover:border-cyber-blue transition-colors cursor-pointer"
            >
              <option value="">[ALL PRODUCT CLASSES]</option>
              {PRODUCT_TYPES.map(type => (
                <option key={type} value={type}>{type.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Event Type filter */}
          <div>
            <label className="block text-[9px] font-mono text-cyber-text uppercase tracking-wider mb-1.5">
              Filter by Event Category
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full bg-background-input border border-cyber-border text-xs px-2.5 py-2 rounded font-mono text-slate-300 focus:outline-none hover:border-cyber-blue transition-colors cursor-pointer"
            >
              <option value="">[ALL EVENT CATEGORIES]</option>
              {EVENT_TYPES.map(event => (
                <option key={event} value={event}>{event.toUpperCase()}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Filter Summary Banner & Clear Button */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between border-t border-cyber-border/40 pt-3">
            <span className="text-[10px] font-mono text-cyber-text uppercase tracking-wider">
              Active Filters Detected. Output size: <span className="text-cyber-green font-bold font-mono">{events.length} records</span>
            </span>
            <button 
              onClick={clearFilters}
              className="text-[10px] font-mono text-cyber-rose hover:underline flex items-center gap-1 font-bold"
            >
              [CLEAR ALL ACTIVE FILTERS]
            </button>
          </div>
        )}

      </div>

      {/* Grid Results Stream */}
      <div className="space-y-4">
        
        {/* Status ticker count */}
        <div className="flex items-center justify-between text-xs font-mono text-cyber-text px-1 uppercase tracking-wider border-b border-cyber-border pb-2">
          <span>Query Stream Ledger</span>
          <span>{loading ? 'STATUS: FILTERING...' : `NODE COUNT: ${events.length} MATCHES`}</span>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-cyber-text animate-pulse uppercase tracking-wider">
            Querying index vector maps... compiling results...
          </div>
        ) : events.length === 0 ? (
          <div className="terminal-panel border border-dashed border-cyber-border rounded-lg p-16 text-center bg-background-card/40">
            <AlertCircle className="w-8 h-8 text-cyber-rose/60 mx-auto mb-3 animate-pulse" />
            <span className="block font-mono text-sm text-cyber-rose uppercase tracking-widest font-bold">
              Query Result Null
            </span>
            <span className="block text-xs text-cyber-text/60 mt-1">
              Your criteria didn't yield matches. Try resetting taxonomies or using alternative AI prompts.
            </span>
            <button 
              onClick={clearFilters}
              className="mt-4 px-4 py-2 border border-cyber-border hover:border-cyber-purple text-xs font-mono rounded text-slate-200 transition-all hover:bg-background-panel"
            >
              RESET INTERFACE
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
