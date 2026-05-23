import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    const companies = await db.getCompanies();
    const events = await db.getEvents();

    // Aggregate statistics per company
    const aggregated = companies.map(c => {
      const companyEvents = events.filter(e => e.company_name.toLowerCase() === c.name.toLowerCase());
      
      const eventTypes = Array.from(new Set(companyEvents.map(e => e.event_type)));
      const productTypes = Array.from(new Set(companyEvents.map(e => e.product_type)));
      const tags = Array.from(new Set(companyEvents.flatMap(e => e.tags)));
      
      const lastEvent = companyEvents.sort((a, b) => b.date.localeCompare(a.date))[0];

      return {
        ...c,
        event_count: companyEvents.length,
        unique_event_types: eventTypes,
        unique_product_types: productTypes,
        all_tags: tags.slice(0, 10),
        last_updated: lastEvent ? lastEvent.date : null,
        recent_activity: lastEvent ? lastEvent.summary : null
      };
    });

    // Sort by companies with the most pivots first
    aggregated.sort((a, b) => b.event_count - a.event_count);

    return NextResponse.json({
      success: true,
      count: aggregated.length,
      companies: aggregated
    });
  } catch (error: any) {
    console.error("[API Companies] Fetch error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve tracked companies ledger.", details: error.message || error },
      { status: 500 }
    );
  }
}
