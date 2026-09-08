import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { client } from '../db.js';
import { requireAuth } from '../auth.js';
import { generateSimpleEmbedding, cosineSimilarity, generateAskLoopAnswer } from '../ai.js';

export const insightsRouter = Router();

const AskQuerySchema = z.object({
  question: z.string().min(2, 'Question must be at least 2 characters'),
});

// POST /api/insights/ask - Semantic RAG Ask LOOP
insightsRouter.post('/ask', async (req: Request, res: Response) => {
  const session = await requireAuth(req, res);
  if (!session) return;

  const parsed = AskQuerySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message } });
  }

  const { question } = parsed.data;

  try {
    // 1. Generate query embedding vector
    const queryVector = generateSimpleEmbedding(question);

    // 2. Retrieve ALL embeddings strictly scoped to the authenticated user's workspace
    const embeddingsRes = await client.execute({
      sql: `SELECT e.feedbackId, e.vector, f.content, f.channel, f.customerLabel, f.sentiment, f.featureArea, f.createdAt
            FROM embeddings e
            JOIN feedback f ON e.feedbackId = f.id
            WHERE f.workspaceId = ?`,
      args: [session.workspaceId],
    });

    // 3. Compute cosine similarity score for each item
    const scoredFeedback: Array<{
      id: string;
      content: string;
      channel: string;
      customerLabel: string | null;
      sentiment: string;
      featureArea: string | null;
      similarity: number;
    }> = [];

    for (const row of embeddingsRes.rows) {
      try {
        const itemVector: number[] = JSON.parse(String(row.vector));
        const sim = cosineSimilarity(queryVector, itemVector);
        scoredFeedback.push({
          id: String(row.feedbackId),
          content: String(row.content),
          channel: String(row.channel),
          customerLabel: row.customerLabel ? String(row.customerLabel) : null,
          sentiment: String(row.sentiment),
          featureArea: row.featureArea ? String(row.featureArea) : null,
          similarity: sim,
        });
      } catch (err) {
        // skip unparseable vector
      }
    }

    // 4. Sort by similarity descending & select Top K (Top 10)
    scoredFeedback.sort((a, b) => b.similarity - a.similarity);
    const topEvidence = scoredFeedback.slice(0, 10);

    // 5. Generate Grounded AI Answer
    const aiResponse = await generateAskLoopAnswer(question, topEvidence);

    // 6. Return response with verified citations
    res.json({
      success: true,
      data: {
        question,
        answer: aiResponse.answer,
        evidenceCount: topEvidence.length,
        sources: topEvidence.map((e) => ({
          feedbackId: e.id,
          content: e.content,
          channel: e.channel,
          customerLabel: e.customerLabel,
          sentiment: e.sentiment,
          featureArea: e.featureArea,
          similarity: Number(e.similarity.toFixed(3)),
        })),
      },
    });
  } catch (err: any) {
    console.error('[Ask LOOP] Error:', err);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to process Ask LOOP query.' } });
  }
});
