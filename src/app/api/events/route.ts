import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateEmbedding } from '@/lib/ai';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filter query parameters
    const slug = searchParams.get('slug') || undefined;
    const product_type = searchParams.get('product_type') || undefined;
    const event_type = searchParams.get('event_type') || undefined;
    const date_start = searchParams.get('date_start') || undefined;
    const date_end = searchParams.get('date_end') || undefined;
    const search_query = searchParams.get('search_query') || undefined;
    
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').map(t => t.trim()).filter(Boolean) : undefined;

    // Semantic Vector Query Parameter
    const semanticQuery = searchParams.get('q') || undefined;
    let search_embedding: number[] | undefined = undefined;

    if (semanticQuery && semanticQuery.trim().length > 0) {
      console.log(`[API Events] Executing semantic vector search for: "${semanticQuery}"`);
      search_embedding = await generateEmbedding(semanticQuery);
    }

    // Retrieve sorted and filtered results
    const events = await db.getEvents({
      slug,
      product_type,
      event_type,
      tags,
      date_start,
      date_end,
      search_query,
      search_embedding
    });

    return NextResponse.json({
      success: true,
      count: events.length,
      filters: { slug, product_type, event_type, tags, date_start, date_end, search_query, q: semanticQuery },
      events
    });
  } catch (error: any) {
    console.error("[API Events] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve product intelligence events.", details: error.message || error },
      { status: 500 }
    );
  }
}
