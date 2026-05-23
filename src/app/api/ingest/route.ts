import { NextResponse } from 'next/server';
import { processIngestion } from '@/lib/ai';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, sourceUrl } = body;

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Invalid ingestion payload. 'text' must be a string of at least 10 characters." },
        { status: 400 }
      );
    }

    const cleanSourceUrl = sourceUrl && typeof sourceUrl === 'string' ? sourceUrl.trim() : "Manual Entry Form";
    
    // Process text into structured ledger block and compute embeddings
    const processedEvent = await processIngestion(text, cleanSourceUrl);

    return NextResponse.json(
      { success: true, event: processedEvent },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[API Ingest] Error executing pipeline:", error);
    return NextResponse.json(
      { error: "Ingestion pipeline failure.", details: error.message || error },
      { status: 500 }
    );
  }
}
