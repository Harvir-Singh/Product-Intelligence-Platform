'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Database, 
  Send, 
  Loader2, 
  Activity, 
  HelpCircle,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [tickerText, setTickerText] = useState('INITIALIZING LEDGER MARQUEE DATA TICKER...');
  const [ingestOpen, setIngestOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [inputSource, setInputSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [successEvent, setSuccessEvent] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [sysTime, setSysTime] = useState('');

  // Clock telemetry
  useEffect(() => {
    function updateClock() {
      const d = new Date();
      setSysTime(d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch recent events to populate marquee text
  useEffect(() => {
    async function fetchTicker() {
      try {
        const res = await fetch('/api/events?limit=5');
        if (res.ok) {
          const data = await res.json();
          if (data.events && data.events.length > 0) {
            const tickerString = data.events.map((e: any) => 
              `* ${e.company_name.toUpperCase()} PIVOT: [${e.event_type.toUpperCase()}] IN ${e.product_type.toUpperCase()} -> ${e.summary.toUpperCase()} (CONFIDENCE: ${e.confidence_score}%)`
            ).join('  |  ');
            setTickerText(tickerString);
          }
        }
      } catch (err) {
        console.error("Ticker fetch failed:", err);
      }
    }
    fetchTicker();
  }, [pathname, loading]); // Refresh ticker when route changes or after new ingestion

  // Handle ingestion submission
  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessEvent(null);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          sourceUrl: inputSource || "Direct Manual Feed"
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessEvent(data.event);
        setInputText('');
        setInputSource('');
        // Trigger soft refresh
        router.refresh();
      } else {
        setErrorMsg(data.error || "Failed to process text.");
      }
    } catch (err: any) {
      setErrorMsg("Network timeout or connection dropped.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="h-16 border-b border-cyber-border bg-[#07090e] flex flex-col justify-between shrink-0 z-30 select-none">
        
        {/* Top telemetry and Ingest bar */}
        <div className="flex-1 flex items-center justify-between px-6">
          
          {/* Header Left Title */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-cyber-text tracking-widest uppercase opacity-75">
              WORKSTATION //
            </span>
            <span className="text-xs font-mono font-semibold text-cyber-blue uppercase tracking-widest glow-text-blue">
              {pathname === '/' ? 'HOME_FEED' : pathname.replace(/\//g, '_').toUpperCase()}
            </span>
          </div>

          {/* Header Right Terminal Controls */}
          <div className="flex items-center gap-6">
            
            {/* System Clock */}
            <span className="hidden md:inline text-[10px] font-mono text-cyber-text tracking-wider opacity-60">
              {sysTime}
            </span>

            {/* AI Status */}
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono border border-cyber-border bg-background-input px-2 py-0.5 rounded">
              <Activity className="w-3 h-3 text-cyber-green animate-pulse" />
              <span className="text-cyber-text">AI PROCESSOR:</span>
              <span className="text-cyber-green">ONLINE</span>
            </div>

            {/* Ingest Action Button */}
            <button 
              onClick={() => {
                setSuccessEvent(null);
                setErrorMsg('');
                setIngestOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#10b981] hover:bg-[#059669] text-black text-xs font-bold font-sans transition-all shadow-[0_0_10px_rgba(16,185,129,0.25)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>INGEST UPDATE</span>
            </button>

          </div>
        </div>

        {/* Bloomberg-style Scrolling Marquee Ticker */}
        <div className="h-6 bg-[#040609] border-t border-cyber-border flex items-center overflow-hidden">
          <div className="w-20 bg-[#00e5ff] text-black text-[9px] font-bold font-mono px-2 py-0.5 shrink-0 flex items-center justify-center tracking-wider glow-text-blue shadow-[0_0_10px_rgba(0,229,255,0.4)]">
            LIVE INDEX
          </div>
          
          <div className="relative w-full overflow-hidden flex items-center h-full">
            <div className="animate-marquee whitespace-nowrap text-[10px] font-mono text-[#00ff88] flex items-center gap-4 py-1">
              <span>{tickerText}</span>
            </div>
          </div>
        </div>

        {/* Global Marquee CSS Animation */}
        <style jsx global>{`
          @keyframes marquee {
            0% { transform: translateX(30%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee {
            animation: marquee 35s linear infinite;
            display: inline-block;
            padding-left: 100%;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>

      </header>

      {/* Ingestion Console Modal popup */}
      {ingestOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-background-card border border-cyber-border shadow-2xl rounded overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="terminal-header">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#10b981] animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-200">
                  STRATEGY INGESTION PIPELINE CONSOLE
                </span>
              </div>
              <button 
                onClick={() => setIngestOpen(false)}
                className="text-cyber-text hover:text-white p-0.5 hover:bg-background-input rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ingest Form Panel */}
            <form onSubmit={handleIngest} className="p-6 space-y-4">
              
              {!successEvent && (
                <>
                  <div className="text-xs font-mono text-cyber-text leading-relaxed">
                    Paste raw text (company blog updates, release changelogs, product announcements, funding releases). The AI layer will process, categorize, and append the record in the timeline ledger.
                  </div>

                  {/* Input Source URL */}
                  <div>
                    <label className="block text-[10px] font-mono text-cyber-text uppercase tracking-wider mb-1.5">
                      Source Document URL (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. https://stripe.com/blog/stripe-billing-decoupled"
                      value={inputSource}
                      onChange={(e) => setInputSource(e.target.value)}
                      className="w-full bg-background-input border border-cyber-border focus:border-cyber-blue text-xs p-2.5 rounded font-mono text-slate-200 focus:outline-none"
                    />
                  </div>

                  {/* Input Body Content */}
                  <div>
                    <label className="block text-[10px] font-mono text-cyber-text uppercase tracking-wider mb-1.5">
                      Unstructured Content Input
                    </label>
                    <textarea 
                      required
                      rows={6}
                      placeholder="Paste changelog markdown or press release text here..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full bg-background-input border border-cyber-border focus:border-cyber-blue text-xs p-2.5 rounded font-mono text-slate-200 focus:outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Success Result Box */}
              {successEvent && (
                <div className="bg-[#121b18] border border-[#0d5c41] p-4 rounded space-y-3">
                  <div className="flex items-center gap-2 text-cyber-green text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>AI Analysis Matrix Compiled Successfully!</span>
                  </div>

                  <div className="border-t border-[#0d5c41] pt-3 space-y-1.5 font-mono text-xs text-slate-300">
                    <div>
                      <span className="text-cyber-text">Entity Name:</span>{" "}
                      <span className="text-slate-100 font-bold">{successEvent.company_name}</span>
                    </div>
                    <div>
                      <span className="text-cyber-text">Product Class:</span>{" "}
                      <span className="text-[#bf55ec]">{successEvent.product_type}</span>
                    </div>
                    <div>
                      <span className="text-cyber-text">Event Category:</span>{" "}
                      <span className="text-[#00e5ff]">{successEvent.event_type}</span>
                    </div>
                    <div>
                      <span className="text-cyber-text">Brief Extract:</span>{" "}
                      <span className="text-slate-200 italic">"{successEvent.summary}"</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-cyber-text">Confidence Level:</span>
                      <span className="text-cyber-green font-bold glow-text-green">{successEvent.confidence_score}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Output Box */}
              {errorMsg && (
                <div className="bg-[#241318] border border-[#721c24] p-3 rounded flex items-center gap-2 text-cyber-rose text-xs font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {successEvent ? (
                  <button 
                    type="button"
                    onClick={() => {
                      setSuccessEvent(null);
                      setIngestOpen(false);
                    }}
                    className="px-4 py-2 bg-background-input border border-cyber-border text-xs rounded font-sans text-slate-200 font-semibold hover:bg-[#1f2538] transition-all"
                  >
                    CLOSE CONSOLE
                  </button>
                ) : (
                  <>
                    <button 
                      type="button"
                      onClick={() => setIngestOpen(false)}
                      className="px-4 py-2 bg-background-input border border-cyber-border text-xs rounded font-sans text-slate-200 font-semibold hover:bg-[#1f2538] transition-all"
                    >
                      CANCEL
                    </button>
                    <button 
                      type="submit"
                      disabled={loading || !inputText.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-cyber-blue text-black text-xs font-bold rounded font-sans hover:bg-[#00c5dd] transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>AI PROCESSING...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>EXECUTE INGESTION</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
