import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ChatAssistant from "./components/ChatAssistant";

export const metadata: Metadata = {
  title: "Product Intelligence OS",
  description: "Bloomberg Terminal for Product Managers. Tracks product strategy evolution over time, structures unstructured content, and compares product strategies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased bg-background text-slate-100 flex h-full w-full overflow-hidden select-none">
        {/* Scanline effect */}
        <div className="scanline" />

        {/* Sidebar Dock */}
        <Sidebar />

        {/* Workspace Body */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {/* Header Command Bar */}
          <Header />

          {/* Page Contents */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-cyber-grid bg-cyber-grid-size p-6 pb-24 md:pb-8">
            {children}
          </main>
        </div>

        {/* Floating AI Chat Assistant Panel */}
        <ChatAssistant />
      </body>
    </html>
  );
}
