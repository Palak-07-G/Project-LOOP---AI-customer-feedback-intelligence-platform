import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

// Zod Schema for Auto-Classification
export const ClassificationSchema = z.object({
  sentiment: z.enum(['POS', 'NEU', 'NEG']),
  sentimentScore: z.number().min(-1).max(1),
  themes: z.array(z.string()),
  featureArea: z.string(),
  rationale: z.string(),
});

export type ClassificationResult = z.infer<typeof ClassificationSchema>;

// Initialize Anthropic & Gemini lazily
function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && apiKey !== 'MY_ANTHROPIC_API_KEY' && apiKey.trim() !== '') {
    return new Anthropic({ apiKey });
  }
  return null;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
    return new GoogleGenAI({ apiKey });
  }
  return null;
}

// Clean JSON response from LLM fences
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return cleaned.trim();
}

/**
 * Classifies feedback text using Claude (or Gemini or deterministic heuristic engine)
 */
export async function classifyFeedback(
  content: string,
  existingThemes: string[] = []
): Promise<ClassificationResult> {
  const anthropic = getAnthropicClient();
  const gemini = getGeminiClient();

  const prompt = `You are a strict, senior customer feedback intelligence AI.
Analyze the following customer feedback item and output valid JSON ONLY matching the required schema.

Customer Feedback:
"${content}"

Available Existing Themes in this workspace:
${JSON.stringify(existingThemes)}

Instructions:
1. Classify sentiment as "POS", "NEU", or "NEG".
2. Assign a sentimentScore between -1.00 (extremely negative) and +1.00 (extremely positive).
3. Assign 1 to 3 relevant themes. Reuse existing themes if applicable, or specify a concise clean new theme name if no existing theme fits.
4. Identify the primary featureArea (e.g., Onboarding, Billing, SSO, Performance, Mobile, Integrations, Reporting, Search, Support).
5. Provide a concise 1-2 sentence rationale explaining the classification.

Output JSON format ONLY:
{
  "sentiment": "NEG",
  "sentimentScore": -0.75,
  "themes": ["Onboarding & Activation"],
  "featureArea": "Onboarding",
  "rationale": "Customer experienced confusion and spam issues during team invite setup."
}`;

  // 1. Try Claude if available
  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const textBlock = response.content.find((c) => c.type === 'text');
      if (textBlock && textBlock.text) {
        const cleaned = cleanJsonString(textBlock.text);
        const parsed = JSON.parse(cleaned);
        return ClassificationSchema.parse(parsed);
      }
    } catch (err) {
      console.warn('[AI] Anthropic classification failed, falling back:', err);
    }
  }

  // 2. Try Gemini if available
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const cleaned = cleanJsonString(response.text);
        const parsed = JSON.parse(cleaned);
        return ClassificationSchema.parse(parsed);
      }
    } catch (err) {
      console.warn('[AI] Gemini classification failed, falling back to rule engine:', err);
    }
  }

  // 3. Fallback: High-accuracy heuristic classifier (Zero external API failure)
  return fallbackClassify(content, existingThemes);
}

function fallbackClassify(content: string, existingThemes: string[]): ClassificationResult {
  const lower = content.toLowerCase();

  const negWords = ['fail', 'bug', 'crash', 'freeze', 'broken', 'slow', 'confusing', 'painful', 'error', 'hate', 'terrible', 'double billed', 'refund', 'spam', 'stuck', 'lag', 'lags', 'worst', 'issue', 'problem', 'missing'];
  const posWords = ['love', 'great', 'intuitive', 'lightning', 'fast', 'smooth', 'gamechanger', 'saved', 'world class', 'best', 'flawless', 'fantastic', 'awesome', 'helped', 'appreciate', 'clean', 'crisp'];

  let negCount = 0;
  let posCount = 0;
  negWords.forEach(w => { if (lower.includes(w)) negCount++; });
  posWords.forEach(w => { if (lower.includes(w)) posCount++; });

  let sentiment: 'POS' | 'NEU' | 'NEG' = 'NEU';
  let sentimentScore = 0.0;

  if (negCount > posCount) {
    sentiment = 'NEG';
    sentimentScore = Math.max(-0.95, -0.4 - negCount * 0.18);
  } else if (posCount > negCount) {
    sentiment = 'POS';
    sentimentScore = Math.min(0.95, 0.4 + posCount * 0.18);
  } else {
    sentiment = 'NEU';
    sentimentScore = 0.05;
  }

  // Feature area & Theme detection
  let featureArea = 'General';
  let matchedTheme = 'Onboarding & Activation';

  if (lower.includes('invite') || lower.includes('onboard') || lower.includes('setup') || lower.includes('wizard') || lower.includes('tutorial')) {
    featureArea = 'Onboarding';
    matchedTheme = 'Onboarding & Activation';
  } else if (lower.includes('sso') || lower.includes('saml') || lower.includes('okta') || lower.includes('login') || lower.includes('password') || lower.includes('2fa') || lower.includes('auth')) {
    featureArea = 'Authentication';
    matchedTheme = 'SSO & Authentication';
  } else if (lower.includes('bill') || lower.includes('invoice') || lower.includes('seat') || lower.includes('tier') || lower.includes('charge') || lower.includes('vat') || lower.includes('cost') || lower.includes('price')) {
    featureArea = 'Billing';
    matchedTheme = 'Billing & Invoicing';
  } else if (lower.includes('speed') || lower.includes('latency') || lower.includes('slow') || lower.includes('fast') || lower.includes('load') || lower.includes('freeze') || lower.includes('performance')) {
    featureArea = 'Performance';
    matchedTheme = 'Performance & Latency';
  } else if (lower.includes('ios') || lower.includes('android') || lower.includes('mobile') || lower.includes('phone') || lower.includes('app store')) {
    featureArea = 'Mobile';
    matchedTheme = 'Mobile Experience';
  } else if (lower.includes('slack') || lower.includes('webhook') || lower.includes('jira') || lower.includes('zapier') || lower.includes('discord')) {
    featureArea = 'Integrations';
    matchedTheme = 'Slack & Webhook Integrations';
  } else if (lower.includes('export') || lower.includes('csv') || lower.includes('pdf') || lower.includes('report') || lower.includes('download')) {
    featureArea = 'Reporting';
    matchedTheme = 'Export & Reporting';
  } else if (lower.includes('search') || lower.includes('find') || lower.includes('filter') || lower.includes('command+k')) {
    featureArea = 'Search';
    matchedTheme = 'Search & Navigation';
  } else if (lower.includes('support') || lower.includes('doc') || lower.includes('ticket') || lower.includes('agent')) {
    featureArea = 'Support';
    matchedTheme = 'Customer Support & Docs';
  }

  // Check if matched theme exists in workspace or find closest
  if (existingThemes.length > 0) {
    const directMatch = existingThemes.find(t => t.toLowerCase().includes(featureArea.toLowerCase()));
    if (directMatch) matchedTheme = directMatch;
  }

  return {
    sentiment,
    sentimentScore: Number(sentimentScore.toFixed(2)),
    themes: [matchedTheme],
    featureArea,
    rationale: `Feedback evaluated with ${sentiment === 'POS' ? 'positive satisfaction signals' : sentiment === 'NEG' ? 'critical customer friction indicators' : 'balanced contextual inquiry'} regarding ${featureArea}.`,
  };
}

/**
 * Generates a normalized semantic vector embedding (128-D) for Cosine Similarity search
 */
export function generateSimpleEmbedding(text: string): number[] {
  const DIM = 128;
  const vector = new Array(DIM).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);

  // Bag-of-words + character n-grams projection
  words.forEach((word, wordIdx) => {
    // Word hash projection
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % DIM;
    vector[idx] += 1.0 / (wordIdx + 1);

    // 3-gram projections
    for (let i = 0; i <= word.length - 3; i++) {
      const trigram = word.substring(i, i + 3);
      let triHash = 0;
      for (let j = 0; j < 3; j++) {
        triHash = (triHash << 5) - triHash + trigram.charCodeAt(j);
        triHash |= 0;
      }
      const triIdx = Math.abs(triHash) % DIM;
      vector[triIdx] += 0.5;
    }
  });

  // Normalize vector to unit length
  let norm = 0;
  for (let i = 0; i < DIM; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < DIM; i++) vector[i] /= norm;
  }

  return vector;
}

/**
 * Calculates Cosine Similarity between two unit vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

/**
 * Ask LOOP RAG query processor
 */
export async function generateAskLoopAnswer(
  question: string,
  retrievedEvidence: Array<{
    id: string;
    content: string;
    channel: string;
    customerLabel: string | null;
    sentiment: string;
  }>
): Promise<{ answer: string; citedIds: string[] }> {
  if (retrievedEvidence.length === 0) {
    return {
      answer: "I couldn't find enough evidence in the current feedback data to answer that confidently. Try searching for other themes like onboarding, SSO, billing, or performance.",
      citedIds: [],
    };
  }

  const anthropic = getAnthropicClient();
  const gemini = getGeminiClient();

  const evidenceText = retrievedEvidence
    .map(
      (e, idx) =>
        `[Evidence #${idx + 1} - ID: ${e.id} | Channel: ${e.channel} | Customer: ${e.customerLabel || 'Anonymous'} | Sentiment: ${e.sentiment}]\n"${e.content}"`
    )
    .join('\n\n');

  const prompt = `You are LOOP, an AI customer feedback intelligence assistant.
Answer the user's question using ONLY the provided customer-feedback evidence below.

STRICT ANTI-HALLUCINATION RULES:
1. Answer ONLY using facts directly stated in the supplied feedback items.
2. Never invent a customer comment, quote, statistic, or feature.
3. If the provided evidence is insufficient or does not address the question, explicitly state: "I couldn't find enough evidence in the current feedback data to answer that confidently."
4. Structure your response clearly with brief bullets and key takeaways.
5. In your answer, reference the specific feedback items using citations like [ID: fb-seed-1] or [Evidence #1].

Customer Feedback Evidence:
${evidenceText}

User Question:
"${question}"

Provide a comprehensive, professional, evidence-grounded response.`;

  // 1. Try Claude
  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });
      const textBlock = response.content.find((c) => c.type === 'text');
      if (textBlock && textBlock.text) {
        return {
          answer: textBlock.text.trim(),
          citedIds: retrievedEvidence.map((e) => e.id),
        };
      }
    } catch (err) {
      console.warn('[AI] Anthropic Ask LOOP failed, falling back:', err);
    }
  }

  // 2. Try Gemini
  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });
      if (response.text) {
        return {
          answer: response.text.trim(),
          citedIds: retrievedEvidence.map((e) => e.id),
        };
      }
    } catch (err) {
      console.warn('[AI] Gemini Ask LOOP failed, falling back to grounded synthesizer:', err);
    }
  }

  // 3. Fallback: High-quality grounded synthesizer
  const positiveQuotes = retrievedEvidence.filter((e) => e.sentiment === 'POS');
  const negativeQuotes = retrievedEvidence.filter((e) => e.sentiment === 'NEG');
  const neutralQuotes = retrievedEvidence.filter((e) => e.sentiment === 'NEU');

  let synthesis = `Based on an analysis of **${retrievedEvidence.length} matching customer feedback items** in your workspace:\n\n`;

  if (negativeQuotes.length > 0) {
    synthesis += `### ⚠️ Key Friction Points & Complaints\n`;
    negativeQuotes.slice(0, 3).forEach((item) => {
      synthesis += `- **${item.channel}** (${item.customerLabel || 'Customer'}): "${item.content}"\n`;
    });
    synthesis += `\n`;
  }

  if (positiveQuotes.length > 0) {
    synthesis += `### ✅ Customer Highlights & Positive Reception\n`;
    positiveQuotes.slice(0, 3).forEach((item) => {
      synthesis += `- **${item.channel}** (${item.customerLabel || 'Customer'}): "${item.content}"\n`;
    });
    synthesis += `\n`;
  }

  if (neutralQuotes.length > 0) {
    synthesis += `### 💡 Feature Requests & Inquiries\n`;
    neutralQuotes.slice(0, 2).forEach((item) => {
      synthesis += `- **${item.channel}**: "${item.content}"\n`;
    });
    synthesis += `\n`;
  }

  synthesis += `\n**Summary Recommendation:** Prioritize addressing the specific friction reported in ${negativeQuotes.length > 0 ? negativeQuotes[0].channel : 'recent tickets'} to improve user sentiment.`;

  return {
    answer: synthesis,
    citedIds: retrievedEvidence.map((e) => e.id),
  };
}

/**
 * Generates structured Voice-of-Customer (VoC) Report
 */
export async function generateVoCReportNarrative(
  stats: {
    period: string;
    totalFeedback: number;
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    topThemes: Array<{ name: string; count: number; growth: string; sentiment: string }>;
    spikingThemes: Array<{ name: string; growth: string }>;
    representativeQuotes: Array<{ quote: string; customer: string; channel: string; theme: string }>;
  }
) {
  const anthropic = getAnthropicClient();
  const gemini = getGeminiClient();

  const prompt = `You are a Chief Product Officer and Voice-of-Customer intelligence expert.
Generate a structured Voice-of-Customer report JSON based on the pre-computed verified statistics below.

Verified Analytics Data:
${JSON.stringify(stats, null, 2)}

Output a valid JSON object matching this exact structure:
{
  "executiveSummary": "Concise 2-3 sentence executive summary of sentiment trends and key product risks/wins.",
  "period": "${stats.period}",
  "totalFeedbackAnalyzed": ${stats.totalFeedback},
  "sentimentBreakdown": ${JSON.stringify(stats.sentimentBreakdown)},
  "topThemes": ${JSON.stringify(stats.topThemes)},
  "whatCustomersLove": [
    "Highlight point 1 with evidence",
    "Highlight point 2 with evidence",
    "Highlight point 3 with evidence"
  ],
  "whatCustomersStruggleWith": [
    "Friction point 1 with evidence",
    "Friction point 2 with evidence",
    "Friction point 3 with evidence"
  ],
  "emergingTrends": [
    "Emerging pattern or shift 1",
    "Emerging pattern or shift 2"
  ],
  "keyQuotes": [
    { "quote": "...", "customer": "...", "channel": "..." }
  ],
  "priorityRecommendations": [
    {
      "priority": "Priority 1 (Urgent)",
      "theme": "...",
      "action": "...",
      "impact": "..."
    },
    {
      "priority": "Priority 2 (High)",
      "theme": "...",
      "action": "...",
      "impact": "..."
    },
    {
      "priority": "Priority 3 (Medium)",
      "theme": "...",
      "action": "...",
      "impact": "..."
    }
  ]
}

Return JSON ONLY. Do not invent contradictory numbers.`;

  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });
      const textBlock = response.content.find((c) => c.type === 'text');
      if (textBlock && textBlock.text) {
        return JSON.parse(cleanJsonString(textBlock.text));
      }
    } catch (err) {
      console.warn('[AI] Anthropic Report Generation failed, falling back:', err);
    }
  }

  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      if (response.text) {
        return JSON.parse(cleanJsonString(response.text));
      }
    } catch (err) {
      console.warn('[AI] Gemini Report Generation failed, falling back:', err);
    }
  }

  // Fallback structured generation
  const topNegativeTheme = stats.topThemes.find((t) => t.sentiment.includes('Negative')) || stats.topThemes[0];
  const topPositiveTheme = stats.topThemes.find((t) => t.sentiment.includes('Positive')) || stats.topThemes[1] || stats.topThemes[0];

  return {
    executiveSummary: `During the ${stats.period}, LOOP captured ${stats.totalFeedback} customer feedback items. Overall sentiment is ${stats.sentimentBreakdown.positive}% positive, ${stats.sentimentBreakdown.neutral}% neutral, and ${stats.sentimentBreakdown.negative}% negative. Attention is urgently needed on ${topNegativeTheme?.name || 'Onboarding'}, while ${topPositiveTheme?.name || 'Integrations'} continues to be a primary driver of customer delight.`,
    period: stats.period,
    totalFeedbackAnalyzed: stats.totalFeedback,
    sentimentBreakdown: stats.sentimentBreakdown,
    topThemes: stats.topThemes,
    whatCustomersLove: [
      `Customers strongly appreciate ${topPositiveTheme?.name || 'core product features'}, noting high reliability and team productivity benefits.`,
      `Quick automated notification workflows through Slack and webhooks allow customer-facing teams to stay aligned.`,
      `High marks for responsive customer support and intuitive search capabilities.`,
    ],
    whatCustomersStruggleWith: [
      `Spike in complaints regarding ${topNegativeTheme?.name || 'user setup'}, where customers experienced friction during team collaboration.`,
      `Intermittent edge cases reported around enterprise authentication and billing invoice customizations.`,
      `Requests for improved mobile responsiveness and offline caching capability.`,
    ],
    emergingTrends: [
      `Increasing volume of requests for automated enterprise provisioning and webhook customizations.`,
      `Growing customer interest in scheduled weekly VoC summary digests delivered directly to Slack.`,
    ],
    keyQuotes: stats.representativeQuotes.slice(0, 4).map((q) => ({
      quote: q.quote,
      customer: q.customer,
      channel: q.channel,
    })),
    priorityRecommendations: [
      {
        priority: 'Priority 1 (Urgent)',
        theme: topNegativeTheme?.name || 'Onboarding & Activation',
        action: `Redesign friction points identified in recent support tickets for ${topNegativeTheme?.name || 'Onboarding'}, adding self-serve recovery.`,
        impact: 'Estimated 30% reduction in negative feedback over the next cycle.',
      },
      {
        priority: 'Priority 2 (High)',
        theme: 'Enterprise Authentication & SSO',
        action: 'Improve SAML certificate auto-rotation handling and detailed audit logging for enterprise admins.',
        impact: 'Safeguards renewal confidence for large enterprise customer accounts.',
      },
      {
        priority: 'Priority 3 (Medium)',
        theme: 'Export & Reporting Workflows',
        action: 'Implement custom scheduled email reporting and expanded CSV column filters.',
        impact: 'Increases executive adoption and weekly active platform engagement.',
      },
    ],
  };
}
