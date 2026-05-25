import { NextResponse } from 'next/server';
import { dbNode } from '@/lib/db-node';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { action, filters, event, slug } = payload;

    if (!action) {
      return NextResponse.json({ error: "Missing required 'action' parameter." }, { status: 400 });
    }

    console.log(`[API Local-DB] Executing action: ${action}`);

    let data: any = null;

    switch (action) {
      case 'getEvents':
        data = dbNode.getEvents(filters);
        break;
      case 'addEvent':
        if (!event) {
          return NextResponse.json({ error: "Missing required 'event' parameter for addEvent action." }, { status: 400 });
        }
        data = dbNode.addEvent(event);
        break;
      case 'getCompanies':
        data = dbNode.getCompanies();
        break;
      case 'getCompany':
        if (!slug) {
          return NextResponse.json({ error: "Missing required 'slug' parameter for getCompany action." }, { status: 400 });
        }
        data = dbNode.getCompany(slug);
        break;
      default:
        return NextResponse.json({ error: `Unsupported database action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[API Local-DB] Controller failure:", error);
    return NextResponse.json({ error: "Local DB execution failure.", details: error.message }, { status: 500 });
  }
}
