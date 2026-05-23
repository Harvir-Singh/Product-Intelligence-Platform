export interface StrategicInsights {
  growth_strategy: string;
  monetization_strategy: string;
  product_strategy: string;
  target_segment: string;
}

export interface ProductEvent {
  id: string;
  company_name: string;
  slug: string;
  product_type: string; // B2B SaaS, AI Product, Developer Tool...
  event_type: string;   // pricing change, product launch, feature release...
  date: string;         // YYYY-MM-DD
  summary: string;
  strategic_insights: StrategicInsights;
  tags: string[];
  source_url: string;
  confidence_score: number;
  embedding: number[];
}

export interface Company {
  name: string;
  slug: string;
  logo_url: string;
  description: string;
  current_product_type: string;
}

export interface DBStore {
  events: ProductEvent[];
  companies: Company[];
}

export const PRODUCT_TYPES = [
  "B2B SaaS",
  "Consumer App",
  "Enterprise Platform",
  "Marketplace",
  "Fintech",
  "AI Product",
  "Developer Tool",
  "Infrastructure",
  "Data Product",
  "Platform Ecosystem"
];

export const EVENT_TYPES = [
  "pricing change",
  "product launch",
  "feature release",
  "funding",
  "hiring shift",
  "expansion",
  "strategy change"
];
