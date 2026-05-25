import { ProductEvent, Company } from './types';
export * from './types';

// Helper to compute cosine similarity between two vector embeddings
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Helper to resolve the local server database bridge URL
const getLocalDBUrl = () => {
  const port = process.env.PORT || '3000';
  return `http://127.0.0.1:${port}/api/local-db`;
};

// Pure Edge Database Client
export const db = {
  getEvents: async (filters?: {
    company_name?: string;
    slug?: string;
    product_type?: string;
    event_type?: string;
    tags?: string[];
    date_start?: string;
    date_end?: string;
    search_query?: string;
    search_embedding?: number[];
  }): Promise<ProductEvent[]> => {
    
    const d1 = (process.env as any).product_intel_db;
    
    // -------------------------------------------------------------
    // A. CLOUD MODE (Cloudflare D1 SQL Binding)
    // -------------------------------------------------------------
    if (d1) {
      console.log("[D1 Client] Executing SQL Query on Cloudflare D1 Space...");
      try {
        let query = "SELECT * FROM events";
        const conditions: string[] = [];
        const params: any[] = [];

        if (filters?.slug) {
          conditions.push("slug = ?");
          params.push(filters.slug.toLowerCase());
        }
        if (filters?.company_name) {
          conditions.push("company_name = ?");
          params.push(filters.company_name);
        }
        if (filters?.product_type) {
          conditions.push("product_type = ?");
          params.push(filters.product_type);
        }
        if (filters?.event_type) {
          conditions.push("event_type = ?");
          params.push(filters.event_type);
        }
        if (filters?.date_start) {
          conditions.push("date >= ?");
          params.push(filters.date_start);
        }
        if (filters?.date_end) {
          conditions.push("date <= ?");
          params.push(filters.date_end);
        }

        if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY date DESC";

        const { results } = await d1.prepare(query).bind(...params).all();
        
        let parsedResults: ProductEvent[] = (results || []).map((row: any) => ({
          id: row.id,
          company_name: row.company_name,
          slug: row.slug,
          product_type: row.product_type,
          event_type: row.event_type,
          date: row.date,
          summary: row.summary,
          strategic_insights: {
            growth_strategy: row.growth_strategy,
            monetization_strategy: row.monetization_strategy,
            product_strategy: row.product_strategy,
            target_segment: row.target_segment
          },
          tags: JSON.parse(row.tags || "[]"),
          source_url: row.source_url,
          confidence_score: row.confidence_score,
          embedding: JSON.parse(row.embedding || "[]")
        }));

        if (filters?.tags && filters.tags.length > 0) {
          parsedResults = parsedResults.filter(e => 
            filters.tags!.every(t => e.tags.map(tag => tag.toLowerCase()).includes(t.toLowerCase()))
          );
        }

        if (filters?.search_query) {
          const q = filters.search_query.toLowerCase();
          parsedResults = parsedResults.filter(e => 
            e.company_name.toLowerCase().includes(q) ||
            e.summary.toLowerCase().includes(q) ||
            e.strategic_insights.product_strategy.toLowerCase().includes(q) ||
            e.tags.some(t => t.toLowerCase().includes(q))
          );
        }

        if (filters?.search_embedding && filters.search_embedding.length > 0) {
          const queryVec = filters.search_embedding;
          type SearchMatch = { event: ProductEvent; score: number };
          const matched: SearchMatch[] = parsedResults.map(e => {
            const score = cosineSimilarity(queryVec, e.embedding);
            return { event: e, score };
          });
          matched.sort((a, b) => b.score - a.score);
          return matched.filter(m => m.score > 0.15).map(m => m.event);
        }

        return parsedResults;
      } catch (err) {
        console.error("[D1 Client] SQL Query Execution failed:", err);
      }
    }

    // -------------------------------------------------------------
    // B. LOCAL DEV MODE (Node Serverless Bridge fetch)
    // -------------------------------------------------------------
    try {
      const res = await fetch(getLocalDBUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getEvents', filters }),
        // Avoid caching locally during live updates
        cache: 'no-store'
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data || [];
      }
    } catch (err) {
      console.warn("[Local DB-Edge] Fetch bridge to local Node store offline, returning empty fallback.", err);
    }
    
    return [];
  },

  addEvent: async (event: Omit<ProductEvent, 'id'>): Promise<ProductEvent> => {
    const d1 = (process.env as any).product_intel_db;
    const newId = Math.random().toString(36).substring(2, 11);
    const companySlug = event.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // -------------------------------------------------------------
    // A. CLOUD MODE (Cloudflare D1 SQL Insert)
    // -------------------------------------------------------------
    if (d1) {
      console.log(`[D1 Client] Appending strategy node to Cloud D1: "${event.company_name}"`);
      try {
        await d1.prepare(`
          INSERT INTO companies (name, slug, logo_url, description, current_product_type)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(slug) DO UPDATE SET current_product_type = ?
        `).bind(
          event.company_name,
          companySlug,
          `https://logo.clearbit.com/${event.company_name.toLowerCase().replace(/\s+/g, '')}.com` || '',
          `${event.company_name} is a leading platform operating in the ${event.product_type} space.`,
          event.product_type,
          event.product_type
        ).run();

        await d1.prepare(`
          INSERT INTO events (
            id, company_name, slug, product_type, event_type, date, summary, 
            growth_strategy, monetization_strategy, product_strategy, target_segment, 
            tags, source_url, confidence_score, embedding
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          newId,
          event.company_name,
          companySlug,
          event.product_type,
          event.event_type,
          event.date,
          event.summary,
          event.strategic_insights.growth_strategy,
          event.strategic_insights.monetization_strategy,
          event.strategic_insights.product_strategy,
          event.strategic_insights.target_segment,
          JSON.stringify(event.tags),
          event.source_url,
          event.confidence_score,
          JSON.stringify(event.embedding)
        ).run();

        return { ...event, id: newId };
      } catch (err) {
        console.error("[D1 Client] SQL Insertion pivot failed:", err);
      }
    }

    // -------------------------------------------------------------
    // B. LOCAL DEV MODE (Node Serverless Bridge fetch)
    // -------------------------------------------------------------
    try {
      const res = await fetch(getLocalDBUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addEvent', event }),
        cache: 'no-store'
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (err) {
      console.warn("[Local DB-Edge] Fetch insert bridge to Node store failed.", err);
    }

    return { ...event, id: newId };
  },

  getCompanies: async (): Promise<Company[]> => {
    const d1 = (process.env as any).product_intel_db;
    
    // -------------------------------------------------------------
    // A. CLOUD MODE (Cloudflare D1 SQL)
    // -------------------------------------------------------------
    if (d1) {
      try {
        const { results } = await d1.prepare("SELECT * FROM companies").all();
        return results || [];
      } catch (err) {
        console.error("[D1 Client] Query companies failed:", err);
      }
    }

    // -------------------------------------------------------------
    // B. LOCAL DEV MODE (Node Serverless Bridge fetch)
    // -------------------------------------------------------------
    try {
      const res = await fetch(getLocalDBUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getCompanies' }),
        cache: 'no-store'
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data || [];
      }
    } catch (err) {
      console.warn("[Local DB-Edge] Fetch companies bridge failed.", err);
    }

    return [];
  },

  getCompany: async (slug: string): Promise<Company | undefined> => {
    const d1 = (process.env as any).product_intel_db;
    
    // -------------------------------------------------------------
    // A. CLOUD MODE (Cloudflare D1 SQL)
    // -------------------------------------------------------------
    if (d1) {
      try {
        const row = await d1.prepare("SELECT * FROM companies WHERE slug = ?").bind(slug.toLowerCase()).first();
        return row || undefined;
      } catch (err) {
        console.error("[D1 Client] Query single company failed:", err);
      }
    }

    // -------------------------------------------------------------
    // B. LOCAL DEV MODE (Node Serverless Bridge fetch)
    // -------------------------------------------------------------
    try {
      const res = await fetch(getLocalDBUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getCompany', slug }),
        cache: 'no-store'
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data || undefined;
      }
    } catch (err) {
      console.warn("[Local DB-Edge] Fetch single company bridge failed.", err);
    }

    return undefined;
  }
};
