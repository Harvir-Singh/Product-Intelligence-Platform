'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  Terminal, 
  HelpCircle, 
  ChevronRight, 
  ArrowUpRight 
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `### Welcome to Product Intelligence OS Analyst Console

I am your on-demand AI Product Strategist. I have access to our entire **Product Memory Graph** of structured company timelines, pricing pivots, and expansion vectors.

Ask me strategic questions such as:
- *What is happening in AI developer tools right now?*
- *How do fintech companies evolve pricing strategies?*
- *Summarize Notion's product evolution.*`
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Handle message send
  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userText = text.trim();
    setInput('');
    setLoading(true);

    const updatedMessages = [...messages, { role: 'user' as const, content: userText }];
    setMessages(updatedMessages);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: updatedMessages.slice(0, -1) // Send conversation history excluding new message
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        const errData = await res.json();
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `### Telemetry Execution Error\n\nFailed to compile response. Details: *${errData.error || 'Server error.'}*` 
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `### Connection Timed Out\n\nUnable to establish communication with the AI processing cluster.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    { title: "AI Dev Tools Trend", query: "What is happening in AI developer tools right now?" },
    { title: "Fintech Pricing Pivot", query: "How do fintech companies evolve pricing strategies?" },
    { title: "Notion Product Chronology", query: "Summarize Notion's product evolution" }
  ];

  // Markdown-like parser helper for rendering response structures beautifully
  const renderMessageContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-sans font-bold text-cyber-blue mt-4 mb-2 first:mt-0 glow-text-blue">{line.substring(4)}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-xs font-mono font-bold text-cyber-purple mt-3 mb-1.5 uppercase tracking-wider">{line.substring(5)}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-base font-sans font-extrabold text-slate-100 mt-5 mb-2.5 border-b border-cyber-border pb-1 first:mt-0">{line.substring(3)}</h2>;
      }
      // Bullet lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const parsedBold = parseBoldAndItalics(line.substring(2));
        return (
          <li key={idx} className="text-xs font-sans text-slate-300 ml-4 list-disc space-y-1 my-1">
            {parsedBold}
          </li>
        );
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        const contentStr = line.replace(/^\d+\.\s/, '');
        const num = line.match(/^\d+/)![0];
        const parsedBold = parseBoldAndItalics(contentStr);
        return (
          <div key={idx} className="text-xs font-sans text-slate-300 ml-4 flex gap-1.5 my-1">
            <span className="text-cyber-green font-mono font-bold">{num}.</span>
            <span>{parsedBold}</span>
          </div>
        );
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      // Standard lines
      return <p key={idx} className="text-xs font-sans text-slate-300 leading-relaxed my-1.5">{parseBoldAndItalics(line)}</p>;
    });
  };

  // Helper to parse double asterisks **bold** and single *italics*
  const parseBoldAndItalics = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-slate-100 font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="text-cyber-green font-mono not-italic font-medium">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Action Cockpit Trigger Button */}
      <button 
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#bf55ec] hover:bg-[#a535d4] text-black shadow-[0_0_15px_rgba(191,85,236,0.5)] hover:shadow-[0_0_20px_rgba(191,85,236,0.7)] flex items-center justify-center transition-all duration-300 transform hover:scale-105 z-40 focus:outline-none"
      >
        <Bot className="w-6 h-6 animate-pulse-slow" />
      </button>

      {/* Floating Strategy Drawer Slide-out Panel */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#090b12] border-l border-cyber-border z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Drawer Header Terminal bar */}
        <div className="terminal-header h-16 border-b border-cyber-border px-4 flex items-center justify-between shrink-0 bg-[#07090e]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyber-purple animate-pulse" />
            <span className="text-xs font-mono font-bold text-slate-200">
              STRATEGIC_ANALYST_CONSOLE //
            </span>
          </div>
          <button 
            onClick={() => setOpen(false)}
            className="text-cyber-text hover:text-white p-1 hover:bg-background-card rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Feed Display viewport */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono select-text bg-cyber-grid bg-cyber-grid-size bg-opacity-10">
          
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col gap-1.5 p-3.5 rounded border max-w-[90%] leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-background-input border-cyber-blue/30 text-slate-200 self-end ml-12' 
                  : 'bg-[#101321]/90 border-cyber-border text-slate-300 self-start mr-12'
              }`}
            >
              <div className="flex items-center gap-1.5 border-b border-cyber-border pb-1.5 mb-2 text-[10px] uppercase font-bold text-cyber-text opacity-70">
                <span>{m.role === 'user' ? 'PM_COMMAND_LINE' : 'AI_STRATEGIST_ADVISORY'}</span>
                <span>//</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              <div className="space-y-1">{renderMessageContent(m.content)}</div>
            </div>
          ))}

          {/* Loading state indicator */}
          {loading && (
            <div className="bg-[#101321]/90 border border-cyber-border p-4 rounded text-xs flex items-center gap-2.5 text-cyber-text self-start mr-12 max-w-[90%] font-mono">
              <Loader2 className="w-4 h-4 animate-spin text-cyber-purple shrink-0" />
              <span className="animate-pulse">ANALYST THINKING: QUERYING VECTOR INDEX GRAPH...</span>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>

        {/* Suggested Queries Ticker */}
        {messages.length === 1 && (
          <div className="p-3 bg-background-card border-t border-cyber-border space-y-2 shrink-0">
            <div className="flex items-center gap-1 text-[10px] font-mono text-cyber-text uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-cyber-blue" />
              <span>Suggested Strategy Commands</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(p.query)}
                  className="w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded text-[11px] bg-background-input border border-cyber-border hover:border-cyber-purple hover:text-white transition-all group"
                >
                  <span className="truncate pr-4 text-cyber-text group-hover:text-slate-200 font-sans">{p.query}</span>
                  <ArrowUpRight className="w-3 h-3 text-cyber-text shrink-0 group-hover:text-cyber-purple group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form Panel */}
        <div className="p-3 bg-[#07090e] border-t border-cyber-border shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }} 
            className="flex items-center gap-2"
          >
            <input 
              type="text"
              disabled={loading}
              placeholder="ASK STRATEGIST ABOUT MONETIZATION, TIMELINES, COMPETITORS..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-background-input border border-cyber-border focus:border-cyber-purple text-xs p-3 rounded font-mono text-slate-200 focus:outline-none placeholder:text-cyber-text/50"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded bg-cyber-purple hover:bg-[#a535d4] disabled:opacity-50 text-black flex items-center justify-center shrink-0 transition-all shadow-[0_0_8px_rgba(191,85,236,0.3)]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </>
  );
}
