import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateEmbedding, generateChatResponse } from '@/lib/ai';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid request. 'message' must be a non-empty string." },
        { status: 400 }
      );
    }

    const chatHistory = Array.isArray(history) ? history : [];

    console.log(`[API Chat] Processing query: "${message}"`);

    // 1. Generate semantic embedding for the query
    const queryEmbedding = await generateEmbedding(message);

    // 2. Perform RAG: retrieve up to 6 highly similar product intelligence events
    const matchedEvents = (await db.getEvents({
      search_embedding: queryEmbedding
    })).slice(0, 6);

    console.log(`[API Chat] Retrieved ${matchedEvents.length} semantic context events for context synthesis.`);

    // 3. Generate response using contextual LLM layer (or simulator fallback)
    const reply = await generateChatResponse(message, chatHistory, matchedEvents);

    return NextResponse.json({
      success: true,
      response: reply,
      context_count: matchedEvents.length,
      context_sources: matchedEvents.map(e => ({
        company_name: e.company_name,
        event_type: e.event_type,
        date: e.date
      }))
    });
  } catch (error: any) {
    console.error("[API Chat] Chat response failure:", error);
    return NextResponse.json(
      { error: "Failed to compile AI response.", details: error.message || error },
      { status: 500 }
    );
  }
}
