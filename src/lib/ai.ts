import { OpenAI } from 'openai';
import { db, ProductEvent } from './db';

// Initialize OpenAI client if API Key is available
const apiKey = process.env.OPENAI_API_KEY || '';
const openai = apiKey ? new OpenAI({ apiKey }) : null;

import { PRODUCT_TYPES, EVENT_TYPES } from './types';

// Ingest unstructured text, process, and append to the DB ledger
export async function processIngestion(rawText: string, sourceUrl: string = "Direct Entry"): Promise<ProductEvent> {
  console.log(`[AI Pipeline] Ingesting text (Length: ${rawText.length} chars)...`);
  
  // 1. Extract structured insights (via OpenAI or high-fidelity simulator)
  const structuredData = await extractStructuredInsights(rawText);
  
  // 2. Generate vector embedding
  const embedding = await generateEmbedding(
    `${structuredData.company_name} - ${structuredData.product_type} - ${structuredData.event_type} - ${structuredData.summary} - ${structuredData.strategic_insights.product_strategy}`
  );
  
  // 3. Save to database
  const newEvent = await db.addEvent({
    ...structuredData,
    source_url: sourceUrl,
    embedding
  });

  console.log(`[AI Pipeline] Successfully processed strategic event for "${newEvent.company_name}" (ID: ${newEvent.id})`);
  return newEvent;
}

// Extract structured parameters from unstructured text
export async function extractStructuredInsights(rawText: string): Promise<Omit<ProductEvent, 'id' | 'embedding' | 'source_url'>> {
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an expert Silicon Valley product strategy analyst. You analyze press releases, blogs, and changelogs.
Your response must be a valid JSON object matching the following structure:
{
  "company_name": "Exact Name of Company",
  "product_type": "One of: B2B SaaS, Consumer App, Enterprise Platform, Marketplace, Fintech, AI Product, Developer Tool, Infrastructure, Data Product, Platform Ecosystem",
  "event_type": "One of: pricing change, product launch, feature release, funding, hiring shift, expansion, strategy change",
  "date": "YYYY-MM-DD (extracted from text or use today's date: 2026-05-22)",
  "summary": "Concise 2-sentence summary of what happened.",
  "strategic_insights": {
    "growth_strategy": "Explain the growth strategy, distribution, or customer acquisition impact.",
    "monetization_strategy": "Explain how this affects monetization, pricing model, LTV, or business model.",
    "product_strategy": "Explain the product design, feature value proposition, and competitive advantage.",
    "target_segment": "Identify the target user segment or market tier (SMB, Enterprise, developers, etc.)"
  },
  "tags": ["3-5 relevant keywords"],
  "confidence_score": 0-100 (rating of how explicit the strategy details are in the text)
}`
          },
          {
            role: "user",
            content: `Extract structured intelligence from this text:\n\n${rawText}`
          }
        ],
        temperature: 0.1
      });

      const parsed = JSON.parse(response.choices[0].message.content || '{}');
      const companyName = parsed.company_name || "Unknown Company";
      const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return {
        company_name: companyName,
        slug,
        product_type: validateEnum(parsed.product_type, PRODUCT_TYPES, "B2B SaaS"),
        event_type: validateEnum(parsed.event_type, EVENT_TYPES, "feature release"),
        date: parsed.date || new Date().toISOString().split('T')[0],
        summary: parsed.summary || "New product activity recorded.",
        strategic_insights: {
          growth_strategy: parsed.strategic_insights?.growth_strategy || "Organic product-led growth expansion.",
          monetization_strategy: parsed.strategic_insights?.monetization_strategy || "Standard value-based monetization.",
          product_strategy: parsed.strategic_insights?.product_strategy || "Improving user experience and workflow integrations.",
          target_segment: parsed.strategic_insights?.target_segment || "General technology builders and consumers."
        },
        tags: Array.isArray(parsed.tags) ? parsed.tags : ["technology"],
        confidence_score: Number(parsed.confidence_score) || 80
      };
    } catch (e) {
      console.warn("[AI Pipeline] OpenAI structured extraction failed. Falling back to simulator...", e);
    }
  }

  // High-fidelity Simulator Fallback
  return simulateStructuredExtraction(rawText);
}

// Generate vector embedding (OpenAI or deterministic simulation)
export async function generateEmbedding(text: string): Promise<number[]> {
  if (openai) {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (e) {
      console.warn("[AI Pipeline] OpenAI embedding failed. Using deterministic mock embedding...", e);
    }
  }

  // Deterministic Mock Embedding (1536 elements)
  // Computes a pseudo-vector based on character frequencies of keywords so similar texts have overlapping values
  const embedding = new Array(1536).fill(0);
  const normalizedText = text.toLowerCase();
  
  // Keyword anchors to ensure semantic-like similarities for specific terms
  const anchors = [
    { word: "pricing", index: 10, weight: 0.8 },
    { word: "charge", index: 10, weight: 0.7 },
    { word: "cost", index: 10, weight: 0.6 },
    { word: "free", index: 25, weight: 0.9 },
    { word: "stripe", index: 50, weight: 0.95 },
    { word: "notion", index: 100, weight: 0.95 },
    { word: "openai", index: 150, weight: 0.95 },
    { word: "gpt", index: 200, weight: 0.9 },
    { word: "llm", index: 200, weight: 0.85 },
    { word: "ai", index: 200, weight: 0.8 },
    { word: "developer", index: 300, weight: 0.9 },
    { word: "api", index: 300, weight: 0.85 },
    { word: "vercel", index: 400, weight: 0.95 },
    { word: "apple", index: 500, weight: 0.95 },
    { word: "acquisition", index: 600, weight: 0.85 },
    { word: "funding", index: 700, weight: 0.9 },
    { word: "venture", index: 700, weight: 0.7 },
  ];

  // Populate base vector using character codes
  for (let i = 0; i < 1536; i++) {
    // Generate wave-like base values
    const charCode = normalizedText.charCodeAt(i % normalizedText.length) || 32;
    embedding[i] = Math.sin(i * charCode) * 0.05;
  }

  // Inject anchor weights
  anchors.forEach(a => {
    if (normalizedText.includes(a.word)) {
      // spread influence around the anchor index
      for (let offset = -5; offset <= 5; offset++) {
        const idx = (a.index + offset + 1536) % 1536;
        embedding[idx] += a.weight * (1 - Math.abs(offset) / 6);
      }
    }
  });

  // Normalize vector to unit length (important for cosine similarity!)
  let magnitude = 0;
  for (let i = 0; i < 1536; i++) {
    magnitude += embedding[i] * embedding[i];
  }
  magnitude = Math.sqrt(magnitude);
  
  if (magnitude > 0) {
    for (let i = 0; i < 1536; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}

// Generate an AI Chatbot answer using OpenAI (RAG) or simulated response builder
export async function generateChatResponse(
  query: string,
  history: { role: string; content: string }[],
  contextEvents: ProductEvent[]
): Promise<string> {
  const contextString = contextEvents.map(e => 
    `Company: ${e.company_name} | Type: ${e.product_type} | Event: ${e.event_type} | Date: ${e.date}\n` +
    `Summary: ${e.summary}\n` +
    `Product Strategy: ${e.strategic_insights.product_strategy}\n` +
    `Monetization: ${e.strategic_insights.monetization_strategy}\n` +
    `Growth: ${e.strategic_insights.growth_strategy}\n` +
    `Target Segment: ${e.strategic_insights.target_segment}\n` +
    `Tags: ${e.tags.join(', ')}\n` +
    `---`
  ).join('\n\n');

  if (openai) {
    try {
      const messages = [
        {
          role: "system",
          content: `You are an expert AI Product Strategy Advisor inside "Product Intelligence OS" (the Bloomberg Terminal for Product Managers).
You have real-time access to structured company evolution logs. Answer the user's questions based on the retrieved context below.

Context company events:
${contextString || "No matching events found in the database. Provide general expert product intelligence."}

Be analytical, data-heavy, professional, and highlight pricing, monetization, growth, and structural shifts. Avoid generalities.`
        },
        ...history,
        { role: "user", content: query }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages as any,
        temperature: 0.3
      });

      return response.choices[0].message.content || "I encountered an error parsing the AI response.";
    } catch (e) {
      console.error("[AI Chat] OpenAI chat failed. Falling back to simulator response...", e);
    }
  }

  // Simulated Chat Response Builder (RAG Fallback)
  return simulateChatResponse(query, contextEvents);
}

// Helper to keep strings strictly within enums
function validateEnum<T extends string>(val: any, list: T[], defaultValue: T): T {
  if (typeof val === 'string' && list.includes(val as T)) {
    return val as T;
  }
  // Try case-insensitive matching
  if (typeof val === 'string') {
    const match = list.find(item => item.toLowerCase() === val.toLowerCase());
    if (match) return match;
  }
  return defaultValue;
}

// High-fidelity heuristic-based AI Extractor Simulator
function simulateStructuredExtraction(text: string): Omit<ProductEvent, 'id' | 'embedding' | 'source_url'> {
  const normalized = text.toLowerCase();
  
  // 1. Identify Company
  let company = "Tech Startup";
  if (normalized.includes("stripe")) company = "Stripe";
  else if (normalized.includes("notion")) company = "Notion";
  else if (normalized.includes("openai") || normalized.includes("chatgpt")) company = "OpenAI";
  else if (normalized.includes("apple") || normalized.includes("iphone") || normalized.includes("macbook")) company = "Apple";
  else if (normalized.includes("vercel") || normalized.includes("next.js")) company = "Vercel";
  else if (normalized.includes("github") || normalized.includes("copilot")) company = "GitHub";
  else if (normalized.includes("atlassian") || normalized.includes("jira")) company = "Atlassian";
  else if (normalized.includes("microsoft") || normalized.includes("azure")) company = "Microsoft";
  else if (normalized.includes("amazon") || normalized.includes("aws")) company = "AWS";
  else {
    // Try to extract first capitalized word
    const match = text.match(/([A-Z][a-zA-Z0-9]+)/);
    if (match && match[1] && !["The", "A", "In", "On", "At", "We", "They", "Our"].includes(match[1])) {
      company = match[1];
    }
  }

  // 2. Identify Product Type
  let productType = "B2B SaaS";
  if (normalized.includes("llm") || normalized.includes("gpt") || normalized.includes("ai") || normalized.includes("copilot") || normalized.includes("generator")) {
    productType = "AI Product";
  } else if (normalized.includes("api") || normalized.includes("sdk") || normalized.includes("developer") || normalized.includes("github") || normalized.includes("code")) {
    productType = "Developer Tool";
  } else if (normalized.includes("payment") || normalized.includes("billing") || normalized.includes("tax") || normalized.includes("payout") || normalized.includes("fintech") || normalized.includes("finance")) {
    productType = "Fintech";
  } else if (normalized.includes("aws") || normalized.includes("cloud") || normalized.includes("serverless") || normalized.includes("infrastructure") || normalized.includes("database")) {
    productType = "Infrastructure";
  } else if (normalized.includes("enterprise") || normalized.includes("crm") || normalized.includes("salesforce")) {
    productType = "Enterprise Platform";
  } else if (normalized.includes("app store") || normalized.includes("marketplace") || normalized.includes("uber") || normalized.includes("airbnb")) {
    productType = "Marketplace";
  } else if (normalized.includes("consumer") || normalized.includes("social") || normalized.includes("mobile app") || normalized.includes("fitness")) {
    productType = "Consumer App";
  }

  // 3. Identify Event Type
  let eventType = "feature release";
  if (normalized.includes("price") || normalized.includes("tier") || normalized.includes("subscription") || normalized.includes("cost") || normalized.includes("free plan") || normalized.includes("billing model")) {
    eventType = "pricing change";
  } else if (normalized.includes("launch") || normalized.includes("introducing") || normalized.includes("announces") || normalized.includes("presents")) {
    eventType = "product launch";
  } else if (normalized.includes("raises") || normalized.includes("funding") || normalized.includes("round") || normalized.includes("million") || normalized.includes("valuation")) {
    eventType = "funding";
  } else if (normalized.includes("hire") || normalized.includes("hiring") || normalized.includes("layoff") || normalized.includes("executive") || normalized.includes("ceo")) {
    eventType = "hiring shift";
  } else if (normalized.includes("pivot") || normalized.includes("strategy") || normalized.includes("rebrands") || normalized.includes("focuses on")) {
    eventType = "strategy change";
  }

  // 4. Generate Date (Today)
  const date = new Date().toISOString().split('T')[0];

  // 5. Generate Summary
  let summary = `Strategic development reported for ${company}. The company has introduced updates impacting its ${productType} strategy.`;
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 0) {
    summary = sentences.slice(0, 2).join(' ').trim();
    if (summary.length > 180) {
      summary = summary.substring(0, 177) + "...";
    }
  }

  // 6. Strategic Insights Template based on combination
  let growth_strategy = `Enhances existing client expansion pathways. By expanding value adds within the ${productType} market, ${company} increases retention and word-of-mouth referral rates.`;
  let monetization_strategy = `Optimizes lifetime value (LTV). This change supports upsell models, improving net revenue retention (NRR) and driving average contract values upward.`;
  let product_strategy = `Strengthens core product stickiness. Integrates deeper into user workflows, raising switching costs and enhancing structural barriers to entry for competitors.`;
  let target_segment = `Focuses heavily on high-growth technology groups and mid-market organizations looking for optimized developer workflows.`;
  let tags = [company.toLowerCase(), productType.toLowerCase(), eventType.replace(/\s+/g, '-')];

  if (eventType === "pricing change") {
    growth_strategy = `Aims to lower friction for early adoption by adjusting tiers, creating a high-velocity landing pathway for SMBs, and setting up clean expansion curves.`;
    monetization_strategy = `Directly shifts pricing vectors, maximizing monetization efficiency by aligning costs with customer value metrics (e.g., usage-based pricing or user seats).`;
    product_strategy = `Aligns feature packages with customer willingness-to-pay (WTP) boundaries. Ensures premium features remain gated to drive tier upgrades.`;
    target_segment = `Price-sensitive mid-market organizations and high-volume power users.`;
    tags.push("pricing-strategy", "unit-economics");
  } else if (productType === "AI Product") {
    growth_strategy = `Leverages the massive global AI wave. Uses hype-to-utility viral adoption cycles to build a substantial user base quickly before driving enterprise utility.`;
    monetization_strategy = `Monetizes high GPU computation costs via premium subscription limits or tokens. Attempts to transition from API usage tokens into recurring SaaS seat licences.`;
    product_strategy = `Introduces cutting-edge LLM reasoning utilities directly into existing user text/data workflows, reducing context-switching and increasing efficiency.`;
    target_segment = `AI early adopters, product managers, and operations teams seeking automated leverage.`;
    tags.push("artificial-intelligence", "generative-ai");
  } else if (productType === "Developer Tool") {
    growth_strategy = `Utilizes bottom-up developer advocacy. Relies on developers trying the tool locally, championing it within engineering organizations, and forcing enterprise purchase.`;
    monetization_strategy = `Locks pricing behind scalability, advanced security (SSO/compliance), and team collaboration features, while keeping the developer sandbox free.`;
    product_strategy = `Provides flawless API interfaces, detailed documentation, and CLI/SDK additions that minimize integration time and friction.`;
    target_segment = `Software engineers, backend architects, and DevOps professionals.`;
    tags.push("devops", "developer-experience");
  }

  const companySlug = company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return {
    company_name: company,
    slug: companySlug,
    product_type: productType,
    event_type: eventType,
    date,
    summary,
    strategic_insights: {
      growth_strategy,
      monetization_strategy,
      product_strategy,
      target_segment
    },
    tags,
    confidence_score: 90
  };
}

// Custom simulated Chat response with RAG similarity synthesis
function simulateChatResponse(query: string, events: ProductEvent[]): string {
  const q = query.toLowerCase();
  
  if (events.length === 0) {
    return `### Product Strategy Advisory Insights

I've searched our historical intelligence databases for queries matching **"${query}"** but did not find exact matching pivot records. 

Based on general industry patterns:
1. **Product Evolution**: High-growth companies typically evolve from point-solutions (e.g., Notion as a editor, Stripe as an API) into **platform ecosystems** where developers build on top of their systems.
2. **Pricing Trajectories**: Successful B2B platforms typically implement **hybrid monetization**—combining a flat subscription seat fee with usage-based variables (e.g., Stripe API calls, OpenAI tokens) to capture expansion.
3. **Distribution Models**: Bottom-up developer tools rely on robust developer experience (DX) sandbox tiers to build virality before pushing enterprise security (SSO, SAML) gates.

Please try entering a specific company (e.g., "Notion", "Stripe", "OpenAI") or a specific topic (e.g., "pricing model changes") to pull contextual strategy shifts.`;
  }

  // Synthesize matching events
  const companyCounts: Record<string, number> = {};
  events.forEach(e => {
    companyCounts[e.company_name] = (companyCounts[e.company_name] || 0) + 1;
  });

  const mainCompany = Object.keys(companyCounts)[0] || "Tracked Companies";

  let response = `### Strategic Intelligence Briefing: "${query}"\n\n`;
  response += `*Retrieved ${events.length} chronological strategy logs from our Product Memory Graph. Key entities: **${Object.keys(companyCounts).join(', ')}**.*\n\n`;

  response += `#### 1. Strategic Timeline Evolution\n`;
  events.slice(0, 3).forEach(e => {
    response += `- **${e.date} (${e.company_name} - ${e.event_type})**: ${e.summary}\n`;
    response += `  - *Product Core*: ${e.strategic_insights.product_strategy}\n`;
  });
  response += `\n`;

  response += `#### 2. Monetization & Pricing Models Analysis\n`;
  const pricingEvents = events.filter(e => e.event_type === "pricing change");
  if (pricingEvents.length > 0) {
    response += `We detected key pricing pivots in this timeline:\n`;
    pricingEvents.forEach(e => {
      response += `- **${e.company_name}** adjusted monetization vectors: *${e.strategic_insights.monetization_strategy}*\n`;
    });
  } else {
    response += `The retrieved strategy logs indicate that ${mainCompany}'s monetization revolves around value-gated seat plans and API token utilization. This reduces friction for developers and scales linearly with company value creation.\n`;
  }
  response += `\n`;

  response += `#### 3. Distribution & Target Segment Alignment\n`;
  const targetSegments = Array.from(new Set(events.map(e => e.strategic_insights.target_segment))).slice(0, 2);
  response += `The primary audience shifts emphasize:\n`;
  targetSegments.forEach((segment, i) => {
    response += `${i + 1}. **Market Focus**: ${segment}\n`;
  });
  response += `\n`;

  response += `#### 4. Macro Analyst Summary & Trends\n`;
  response += `The data demonstrates a clear transition of ${mainCompany} from a pure product offering into a **connected ecosystem**. This increases switching costs significantly (raising the product moat) and sets up a robust framework for compound growth.`;

  return response;
}
