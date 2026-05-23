import { db, DBStore, Company, ProductEvent } from './db';
import { generateEmbedding } from './ai';

// Pre-generated seed events list to ensure high-fidelity mock vector embeddings are loaded
export async function getSeedStore(): Promise<DBStore> {
  console.log('[Seed DB] Initiating seeding process...');

  const companies: Company[] = [
    {
      name: "Stripe",
      slug: "stripe",
      logo_url: "https://logo.clearbit.com/stripe.com",
      description: "Stripe is a global financial infrastructure platform that builds economic infrastructure for the internet.",
      current_product_type: "Fintech"
    },
    {
      name: "Notion",
      slug: "notion",
      logo_url: "https://logo.clearbit.com/notion.so",
      description: "Notion is a single space where you can think, write, and plan. Capture thoughts, manage projects, or run an entire company.",
      current_product_type: "B2B SaaS"
    },
    {
      name: "OpenAI",
      slug: "openai",
      logo_url: "https://logo.clearbit.com/openai.com",
      description: "OpenAI is an AI research and deployment company. Our mission is to ensure that artificial general intelligence benefits all of humanity.",
      current_product_type: "AI Product"
    },
    {
      name: "Apple",
      slug: "apple",
      logo_url: "https://logo.clearbit.com/apple.com",
      description: "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
      current_product_type: "Platform Ecosystem"
    },
    {
      name: "Vercel",
      slug: "vercel",
      logo_url: "https://logo.clearbit.com/vercel.com",
      description: "Vercel provides the developer experience and infrastructure to build, deploy, and scale frontend applications globally.",
      current_product_type: "Developer Tool"
    },
    {
      name: "GitHub",
      slug: "github",
      logo_url: "https://logo.clearbit.com/github.com",
      description: "GitHub is the world's leading AI-powered developer platform to build, scale, and secure software.",
      current_product_type: "Developer Tool"
    }
  ];

  const rawEvents = [
    // --- OPENAI EVOLUTION ---
    {
      company_name: "OpenAI",
      slug: "openai",
      product_type: "AI Product",
      event_type: "product launch",
      date: "2023-11-06",
      summary: "OpenAI launches GPTs, letting users create custom versions of ChatGPT for specific tasks, and introduces the GPT Store for distribution.",
      strategic_insights: {
        growth_strategy: "Leverages consumer developer network effects. By allowing users to distribute customized agents, OpenAI initiates a double-sided platform marketplace strategy.",
        monetization_strategy: "Creates a revenue share ecosystem for custom GPT developers, locking users into ChatGPT Plus memberships ($20/month) to access the store.",
        product_strategy: "Transitions OpenAI from a single point utility tool (ChatGPT) into a massive Platform Ecosystem, raising switching costs to astronomical heights.",
        target_segment: "Consumer builders, power users, and SMB operations teams seeking tailored automations."
      },
      tags: ["openai", "custom-gpts", "marketplace", "ai-agents", "product-launch"]
    },
    {
      company_name: "OpenAI",
      slug: "openai",
      product_type: "AI Product",
      event_type: "pricing change",
      date: "2024-01-25",
      summary: "OpenAI dramatically slashes GPT-3.5 Turbo API pricing by 50% for input tokens and 25% for output tokens to drive developer adoption.",
      strategic_insights: {
        growth_strategy: "Commoditizes LLM token costs to starve out open-source competitors (e.g., Llama) and capture long-tail developer integrations.",
        monetization_strategy: "Volume-based usage scale. Drives total platform revenue by scaling total API requests while operating on high aggregate margins.",
        product_strategy: "Allows developers to build highly interactive, multi-agent AI features on top of OpenAI without fearing unit economic death.",
        target_segment: "Software engineers, startup founders, and developer-centric enterprises."
      },
      tags: ["openai", "api-pricing", "developer-adoption", "unit-economics", "pricing-change"]
    },
    {
      company_name: "OpenAI",
      slug: "openai",
      product_type: "AI Product",
      event_type: "product launch",
      date: "2024-05-13",
      summary: "OpenAI releases GPT-4o, a native multimodal model integrating voice, text, and vision inputs, and makes it available to free-tier users.",
      strategic_insights: {
        growth_strategy: "Virality and top-of-funnel customer acquisition. Offering multimodal intelligence for free creates massive lock-in and crushes consumer competitors like Gemini.",
        monetization_strategy: "Free-to-Premium upselling. Free tiers are rate-limited. Power users must upgrade to ChatGPT Plus for higher volume limits and advanced voice options.",
        product_strategy: "Native multimodality removes the latency and cost of routing text through external transcription pipelines, providing an unmatched real-time audio experience.",
        target_segment: "Global consumers, customer service architects, and mobile-first users."
      },
      tags: ["openai", "gpt-4o", "multimodal", "free-tier", "product-launch"]
    },

    // --- STRIPE EVOLUTION ---
    {
      company_name: "Stripe",
      slug: "stripe",
      product_type: "Fintech",
      event_type: "product launch",
      date: "2023-04-18",
      summary: "Stripe launches Stripe Tax globally, allowing merchants to automatically calculate, collect, and file sales tax, VAT, and GST in over 40 countries.",
      strategic_insights: {
        growth_strategy: "Cross-selling and average order value (AOV) expansion. Stripe attaches tax compliance solutions directly to existing Stripe Checkout merchants.",
        monetization_strategy: "High-margin auxiliary revenue. Charges a transaction-based fee (e.g., 0.5% or a flat fee per transaction) on top of the base 2.9% payment fee.",
        product_strategy: "Removes a major global expansion friction point for SaaS startups, cementing Stripe as the core operational back-office for digital commerce.",
        target_segment: "Global B2B SaaS builders, e-commerce merchants, and digital goods marketplaces."
      },
      tags: ["stripe", "stripe-tax", "compliance", "cross-sell", "product-launch"]
    },
    {
      company_name: "Stripe",
      slug: "stripe",
      product_type: "Fintech",
      event_type: "strategy change",
      date: "2024-04-23",
      summary: "Stripe decouples its payment processing engine from the rest of its financial suite, letting enterprise customers use Stripe Billing, Tax, and Radar with other payment processors.",
      strategic_insights: {
        growth_strategy: "Enterprise market penetration. Allows Stripe to target massive enterprises (e.g., Netflix, Uber) that have long-standing merchant acquirers but need advanced billing or fraud tooling.",
        monetization_strategy: "Unbundled feature monetization. Captures multi-million dollar SaaS revenues from Billing/Radar without requiring the payment volumes to move.",
        product_strategy: "Transitions Stripe from an all-in-one payment gateway into a modular, interoperable Financial Infrastructure ecosystem.",
        target_segment: "Fortune 500 enterprises, legacy platforms, and high-volume marketplaces."
      },
      tags: ["stripe", "unbundling", "enterprise-infrastructure", "billing", "strategy-change"]
    },

    // --- NOTION EVOLUTION ---
    {
      company_name: "Notion",
      slug: "notion",
      product_type: "B2B SaaS",
      event_type: "product launch",
      date: "2023-02-22",
      summary: "Notion launches Notion AI globally as an add-on product, bringing generative text drafting, brainstorming, summarizing, and translation into any workspace.",
      strategic_insights: {
        growth_strategy: "Instant product-led value creation. Notion infuses AI directly where user content lives, avoiding the need for users to copy-paste into ChatGPT.",
        monetization_strategy: "Pure high-margin SaaS add-on. Charges $10/user/month (or $8 billed annually), adding recurring SaaS revenue with minimal marginal distribution costs.",
        product_strategy: "Prevents document attrition by integrating writing assistants directly inside the document workspace. Consolidates multi-tool workflows.",
        target_segment: "SaaS workers, product teams, knowledge managers, and SMB builders."
      },
      tags: ["notion", "notion-ai", "generative-writing", "saas-addon", "product-launch"]
    },
    {
      company_name: "Notion",
      slug: "notion",
      product_type: "B2B SaaS",
      event_type: "expansion",
      date: "2024-01-17",
      summary: "Notion releases Notion Calendar, integrating calendar scheduling and meeting coordination directly into the Notion document database workspace.",
      strategic_insights: {
        growth_strategy: "Workplace software consolidation. By absorbing calendar utility (formerly Cron, which they acquired), Notion blocks Google Calendar tool lock-outs.",
        monetization_strategy: "Retention expansion. The calendar tool is bundled for free, driving workspace value and preventing churn to competitors (e.g., ClickUp, Asana).",
        product_strategy: "Binds time-management metadata directly to workspace project documents. Leverages structural integrations to enhance work speed.",
        target_segment: "Project managers, distributed remote teams, and highly organized professionals."
      },
      tags: ["notion", "notion-calendar", "cron-acquisition", "workspace-consolidation", "expansion"]
    },

    // --- VERCEL EVOLUTION ---
    {
      company_name: "Vercel",
      slug: "vercel",
      product_type: "Developer Tool",
      event_type: "product launch",
      date: "2023-10-24",
      summary: "Vercel introduces v0.dev, a generative AI interface that outputs copy-pasteable Tailwind CSS and React shadcn/ui components from natural language descriptions.",
      strategic_insights: {
        growth_strategy: "Massive engineering and design virality. Providing a high-fidelity visual compiler creates viral developer-designer Twitter/GitHub feedback loops.",
        monetization_strategy: "Usage token credits. Free tiers are given limited generation credits. Developers buy monthly premium tiers for high-volume generations and private code options.",
        product_strategy: "Funnels developers directly into Vercel's ecosystem. Code generated in v0 is immediately deployable onto Vercel hosting.",
        target_segment: "Frontend developers, product designers, and full-stack software engineers."
      },
      tags: ["vercel", "v0", "generative-ui", "tailwindcss", "product-launch"]
    },
    {
      company_name: "Vercel",
      slug: "vercel",
      product_type: "Developer Tool",
      event_type: "pricing change",
      date: "2024-04-09",
      summary: "Vercel refactors its serverless bandwidth and serverless function execution pricing, lowering bandwidth rates by up to 50% and adjusting execution models to match compute usage.",
      strategic_insights: {
        growth_strategy: "Mitigates pricing friction. Addresses the 'Vercel bill shock' narrative that scared high-traffic startups into self-hosting or moving to AWS.",
        monetization_strategy: "Transition from margin-heavy bandwidth surcharges into transparent compute-based pricing, aligning bills with utility value.",
        product_strategy: "Solidifies Vercel as the premium but fair choice for running production workloads, ensuring scale-stage companies stay on Vercel.",
        target_segment: "High-growth startups, media platforms, and enterprise web engineering teams."
      },
      tags: ["vercel", "serverless-pricing", "bandwidth-bill", "pricing-change"]
    },

    // --- APPLE EVOLUTION ---
    {
      company_name: "Apple",
      slug: "apple",
      product_type: "Platform Ecosystem",
      event_type: "strategy change",
      date: "2024-06-10",
      summary: "Apple announces Apple Intelligence, a deeply integrated, on-device and private cloud AI architecture spanning iOS, iPadOS, and macOS, partnering with OpenAI.",
      strategic_insights: {
        growth_strategy: "Hardware replacement super-cycle. AI features are gated to the latest high-memory processing chips (A17 Pro / M1 or later), forcing device upgrades.",
        monetization_strategy: "Maintains standard hardware margins while establishing a future 'AI App Store' distribution gateway for third-party AI models.",
        product_strategy: "Context-aware, private agentic flows. Apple places AI directly inside standard OS apps (Siri, Mail, Photos), bypassing stand-alone AI client apps.",
        target_segment: "Global consumer ecosystem and privacy-focused business professionals."
      },
      tags: ["apple", "apple-intelligence", "privacy-cloud", "ios18", "strategy-change"]
    },

    // --- GITHUB EVOLUTION ---
    {
      company_name: "GitHub",
      slug: "github",
      product_type: "Developer Tool",
      event_type: "product launch",
      date: "2023-11-08",
      summary: "GitHub launches Copilot Chat, an interactive natural language chat panel integrated directly inside VS Code and JetBrains IDEs to assist developer workflows.",
      strategic_insights: {
        growth_strategy: "High retention bottom-up scaling. Integrating chat directly in the IDE stops engineers from tab-switching to web browsers, creating total workflow lock-in.",
        monetization_strategy: "High margin expansion. Copilot Enterprise seats are priced at $39/user/month (vs $19 for Business), capitalizing on advanced codebase-indexing.",
        product_strategy: "Positions GitHub Copilot as an active pair programmer, shifting IDE code autocomplete into structured codebase engineering advisory.",
        target_segment: "Software engineers, developer teams, and enterprise IT leaders."
      },
      tags: ["github", "copilot-chat", "ide-integration", "developer-experience", "product-launch"]
    }
  ];

  // 1. Initialize DB Cache
  const store: DBStore = {
    events: [],
    companies: companies
  };

  // 2. Pre-process and inject mock/live embeddings for all seed events
  for (const e of rawEvents) {
    const embeddingText = `${e.company_name} - ${e.product_type} - ${e.event_type} - ${e.summary} - ${e.strategic_insights.product_strategy}`;
    const embedding = await generateEmbedding(embeddingText);
    
    const eventWithId: ProductEvent = {
      ...e,
      id: Math.random().toString(36).substring(2, 11),
      confidence_score: 95, // High seed validation confidence
      embedding,
      source_url: "Official Company Press Release"
    };

    store.events.push(eventWithId);
  }

  console.log(`[Seed DB] Seeding compiled! Prepared ${store.companies.length} companies and ${store.events.length} chronological product strategy pivots.`);
  return store;
}
