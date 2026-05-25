import fs from 'fs';
import path from 'path';
import { ProductEvent, Company, DBStore } from './types';
import { getSeedStore } from './seed';

const STORE_PATH = path.join(process.cwd(), 'src', 'lib', 'data-store.json');

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

let dbCache: DBStore | null = null;

// Initialize Local JSON Database Store
export function initLocalDB(): DBStore {
  if (dbCache) return dbCache;

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
      getSeedStore().then((seededStore) => {
        saveLocalDB(seededStore);
        console.log("[Local DB-Node] Auto-seeding local database complete.");
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
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

// Local Database manager for Node API execution
export const dbNode = {
  getEvents: (filters?: {
    company_name?: string;
    slug?: string;
    product_type?: string;
    event_type?: string;
    tags?: string[];
    date_start?: string;
    date_end?: string;
    search_query?: string;
    search_embedding?: number[];
  }): ProductEvent[] => {
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

  addEvent: (event: Omit<ProductEvent, 'id'>): ProductEvent => {
    const store = initLocalDB();
    const newId = Math.random().toString(36).substring(2, 11);
    const companySlug = event.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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

  getCompanies: (): Company[] => {
    const store = initLocalDB();
    return store.companies;
  },

  getCompany: (slug: string): Company | undefined => {
    const store = initLocalDB();
    return store.companies.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  }
};
