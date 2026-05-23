import { ProductEvent, Company, DBStore } from './types';
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

// In-memory caching for local development
let dbCache: DBStore | null = null;

// Initialize Local JSON Database Store
export function initLocalDB(): DBStore {
  if (dbCache) return dbCache;

  const req = eval('require');
  const fs = req('fs');
  const path = req('path');
  const STORE_PATH = path.join(process.cwd(), 'src', 'lib', 'data-store.json');

  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(STORE_PATH)) {
    const emptyState: DBStore = { events: [], companies: [] };
    fs.writeFileSync(STORE_PATH, JSON.stringify(emptyState, null, 2), 'utf-8');
    dbCache = emptyState;
    
    // Attempt auto-seed
    try {
      const { getSeedStore } = req('./seed');
      getSeedStore().then((seededStore: DBStore) => {
        saveLocalDB(seededStore);
        console.log("[Local DB] Auto-seeding database from seed template completed successfully.");
      });
    } catch (e) {
      console.error("Auto-seeding failed:", e);
    }
    
    return dbCache as DBStore;
  }

  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    dbCache = JSON.parse(raw);
    return dbCache as DBStore;
  } catch (e) {
    const emptyState: DBStore = { events: [], companies: [] };
    fs.writeFileSync(STORE_PATH, JSON.stringify(emptyState, null, 2), 'utf-8');
    dbCache = emptyState;
    return dbCache;
  }
}

// Save Local JSON Database Store
export function saveLocalDB(store: DBStore) {
  dbCache = store;
  const req = eval('require');
  const fs = req('fs');
  const path = req('path');
  const STORE_PATH = path.join(process.cwd(), 'src', 'lib', 'data-store.json');
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

// Hybrid Edge DB Client
export const db = {
  // Retrieve events
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
    
    // Check if Cloudflare D1 database binding is present (Cloud Mode)
    const d1 = (process.env as any).product_intel_db;
    
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
        
        // Parse serialized JSON text fields
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

        // Filter by tags in memory
        if (filters?.tags && filters.tags.length > 0) {
          parsedResults = parsedResults.filter(e => 
            filters.tags!.every(t => e.tags.map(tag => tag.toLowerCase()).includes(t.toLowerCase()))
          );
        }

        // Textual keyword filter in memory
        if (filters?.search_query) {
          const q = filters.search_query.toLowerCase();
          parsedResults = parsedResults.filter(e => 
            e.company_name.toLowerCase().includes(q) ||
            e.summary.toLowerCase().includes(q) ||
            e.strategic_insights.product_strategy.toLowerCase().includes(q) ||
            e.tags.some(t => t.toLowerCase().includes(q))
          );
        }

        // Vector Cosine Similarity Search in memory
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
    // LOCAL FILE PERSISTENCE MODE (JSON fallback)
    // -------------------------------------------------------------
    const store = initLocalDB();
    let results = [...store.events];

    if (filters?.slug) {
      results = results.filter(e => e.slug.toLowerCase() === filters.slug!.toLowerCase());
    }
    if (filters?.company_name) {
      results = results.filter(e => e.company_name.toLowerCase() === filters.company_name!.toLowerCase());
    }
    if (filters?.product_type) {
      results = results.filter(e => e.product_type === filters.product_type);
    }
    if (filters?.event_type) {
      results = results.filter(e => e.event_type === filters.event_type);
    }
    if (filters?.tags && filters.tags.length > 0) {
      results = results.filter(e => 
        filters.tags!.every(t => e.tags.map(tag => tag.toLowerCase()).includes(t.toLowerCase()))
      );
    }
    if (filters?.date_start) {
      results = results.filter(e => e.date >= filters.date_start!);
    }
    if (filters?.date_end) {
      results = results.filter(e => e.date <= filters.date_end!);
    }
    if (filters?.search_query) {
      const q = filters.search_query.toLowerCase();
      results = results.filter(e => 
        e.company_name.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.strategic_insights.product_strategy.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filters?.search_embedding && filters.search_embedding.length > 0) {
      const queryVec = filters.search_embedding;
      type SearchMatch = { event: ProductEvent; score: number };
      const matched: SearchMatch[] = results.map(e => {
        const score = e.embedding && e.embedding.length > 0 ? cosineSimilarity(queryVec, e.embedding) : 0;
        return { event: e, score };
      });
      matched.sort((a, b) => b.score - a.score);
      return matched.filter(m => m.score > 0.15).map(m => m.event);
    }

    return results.sort((a, b) => b.date.localeCompare(a.date));
  },

  // Append new event
  addEvent: async (event: Omit<ProductEvent, 'id'>): Promise<ProductEvent> => {
    const d1 = (process.env as any).product_intel_db;
    const newId = Math.random().toString(36).substring(2, 11);
    const companySlug = event.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (d1) {
      console.log(`[D1 Client] Appending strategy node to Cloud D1: "${event.company_name}"`);
      try {
        // 1. Insert/Update company aggregate profile
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

        // 2. Insert chronological pivot block
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
    // LOCAL DEV FILE PERSISTENCE MODE
    // -------------------------------------------------------------
    const store = initLocalDB();
    const duplicate = store.events.find(e => 
      e.company_name.toLowerCase() === event.company_name.toLowerCase() &&
      e.date === event.date &&
      e.event_type === event.event_type
    );
    if (duplicate) return duplicate;

    const newEvent: ProductEvent = { ...event, id: newId };
    store.events.push(newEvent);

    let comp = store.companies.find(c => c.name.toLowerCase() === event.company_name.toLowerCase());
    if (!comp) {
      comp = {
        name: event.company_name,
        slug: companySlug,
        logo_url: `https://logo.clearbit.com/${event.company_name.toLowerCase().replace(/\s+/g, '')}.com` || '',
        description: `${event.company_name} is a leading platform operating in the ${event.product_type} space.`,
        current_product_type: event.product_type
      };
      store.companies.push(comp);
    } else {
      comp.current_product_type = event.product_type;
    }

    saveLocalDB(store);
    return newEvent;
  },

  // Get all unique companies
  getCompanies: async (): Promise<Company[]> => {
    const d1 = (process.env as any).product_intel_db;
    if (d1) {
      console.log("[D1 Client] Querying all company profiles from D1...");
      try {
        const { results } = await d1.prepare("SELECT * FROM companies").all();
        return results || [];
      } catch (err) {
        console.error("[D1 Client] Query companies failed:", err);
      }
    }

    const store = initLocalDB();
    return store.companies;
  },

  // Get single company by slug
  getCompany: async (slug: string): Promise<Company | undefined> => {
    const d1 = (process.env as any).product_intel_db;
    if (d1) {
      try {
        const row = await d1.prepare("SELECT * FROM companies WHERE slug = ?").bind(slug.toLowerCase()).first();
        return row || undefined;
      } catch (err) {
        console.error("[D1 Client] Query single company failed:", err);
      }
    }

    const store = initLocalDB();
    return store.companies.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  }
};
