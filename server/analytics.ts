import { client } from './db';

export interface DashboardFilters {
  dateRange?: string; // '7d' | '30d' | '90d' | 'all'
  channel?: string;
  sentiment?: string; // 'POS' | 'NEU' | 'NEG'
  themeId?: string;
  status?: string; // 'NEW' | 'REVIEWED' | 'ACTIONED'
  search?: string;
}

export async function getDashboardData(workspaceId: string, filters: DashboardFilters = {}) {
  const days = filters.dateRange === '7d' ? 7 : filters.dateRange === '90d' ? 90 : filters.dateRange === 'all' ? 365 : 30;
  const nowMs = Date.now();
  const currentStartMs = nowMs - days * 86400000;
  const prevStartMs = currentStartMs - days * 86400000;

  const currentStartDate = new Date(currentStartMs).toISOString();
  const prevStartDate = new Date(prevStartMs).toISOString();

  // 1. Base Query with filters
  let whereClauses = ['f.workspaceId = ?'];
  let queryArgs: any[] = [workspaceId];

  if (filters.channel && filters.channel !== 'ALL') {
    whereClauses.push('f.channel = ?');
    queryArgs.push(filters.channel);
  }

  if (filters.sentiment && filters.sentiment !== 'ALL') {
    whereClauses.push('f.sentiment = ?');
    queryArgs.push(filters.sentiment);
  }

  if (filters.status && filters.status !== 'ALL') {
    whereClauses.push('f.status = ?');
    queryArgs.push(filters.status);
  }

  if (filters.search && filters.search.trim() !== '') {
    whereClauses.push('(f.content LIKE ? OR f.customerLabel LIKE ?)');
    queryArgs.push(`%${filters.search.trim()}%`, `%${filters.search.trim()}%`);
  }

  const baseWhereSql = whereClauses.join(' AND ');

  // Current period feedback
  const currentFeedbackRes = await client.execute({
    sql: `SELECT f.id, f.content, f.channel, f.sentiment, f.sentimentScore, f.status, f.createdAt, f.customerLabel, f.featureArea 
          FROM feedback f 
          WHERE ${baseWhereSql} AND f.createdAt >= ? 
          ORDER BY f.createdAt DESC`,
    args: [...queryArgs, currentStartDate],
  });
  const currentFeedback = currentFeedbackRes.rows;

  // Previous period feedback count for delta calculation
  const prevFeedbackRes = await client.execute({
    sql: `SELECT COUNT(*) as count, 
                 SUM(CASE WHEN f.sentiment = 'NEG' THEN 1 ELSE 0 END) as negCount 
          FROM feedback f 
          WHERE ${baseWhereSql} AND f.createdAt >= ? AND f.createdAt < ?`,
    args: [...queryArgs, prevStartDate, currentStartDate],
  });
  const prevCount = Number(prevFeedbackRes.rows[0]?.count || 0);
  const prevNegCount = Number(prevFeedbackRes.rows[0]?.negCount || 0);

  // Totals & Sentiment Breakdown
  const totalCount = currentFeedback.length;
  let posCount = 0;
  let neuCount = 0;
  let negCount = 0;
  let newThisWeekCount = 0;
  const oneWeekAgo = new Date(nowMs - 7 * 86400000).toISOString();

  currentFeedback.forEach((f: any) => {
    if (f.sentiment === 'POS') posCount++;
    else if (f.sentiment === 'NEG') negCount++;
    else neuCount++;

    if (f.createdAt >= oneWeekAgo) newThisWeekCount++;
  });

  const totalSafe = Math.max(totalCount, 1);
  const posPct = Math.round((posCount / totalSafe) * 100);
  const neuPct = Math.round((neuCount / totalSafe) * 100);
  const negPct = Math.round((negCount / totalSafe) * 100);

  // Growth calculations
  const totalGrowth = prevCount === 0 ? 0 : Number((((totalCount - prevCount) / prevCount) * 100).toFixed(1));
  const prevNegPct = prevCount === 0 ? 0 : Math.round((prevNegCount / prevCount) * 100);
  const negPctDelta = Number((negPct - prevNegPct).toFixed(1));

  // 2. Feedback Volume Over Time (Time series bucketed by day/week)
  const volumeMap: Record<string, { date: string; positive: number; neutral: number; negative: number; total: number }> = {};
  
  // Initialize date buckets
  const bucketCount = Math.min(days, 30);
  const stepMs = (days * 86400000) / bucketCount;
  for (let i = bucketCount - 1; i >= 0; i--) {
    const bucketDate = new Date(nowMs - i * stepMs);
    const dateLabel = bucketDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    volumeMap[dateLabel] = { date: dateLabel, positive: 0, neutral: 0, negative: 0, total: 0 };
  }

  currentFeedback.forEach((f: any) => {
    const d = new Date(f.createdAt as string);
    const dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (volumeMap[dateLabel]) {
      volumeMap[dateLabel].total++;
      if (f.sentiment === 'POS') volumeMap[dateLabel].positive++;
      else if (f.sentiment === 'NEG') volumeMap[dateLabel].negative++;
      else volumeMap[dateLabel].neutral++;
    }
  });

  const volumeOverTime = Object.values(volumeMap);

  // 3. Top Themes Query
  const topThemesRes = await client.execute({
    sql: `SELECT t.id, t.name, t.color, COUNT(ft.feedbackId) as count,
                 SUM(CASE WHEN f.sentiment = 'POS' THEN 1 ELSE 0 END) as posCount,
                 SUM(CASE WHEN f.sentiment = 'NEU' THEN 1 ELSE 0 END) as neuCount,
                 SUM(CASE WHEN f.sentiment = 'NEG' THEN 1 ELSE 0 END) as negCount
          FROM themes t
          JOIN feedback_themes ft ON t.id = ft.themeId
          JOIN feedback f ON ft.feedbackId = f.id
          WHERE f.workspaceId = ? AND f.createdAt >= ?
          GROUP BY t.id, t.name, t.color
          ORDER BY count DESC
          LIMIT 8`,
    args: [workspaceId, currentStartDate],
  });

  const topThemes = topThemesRes.rows.map((r: any) => ({
    id: String(r.id),
    name: String(r.name),
    color: String(r.color || '#6366f1'),
    count: Number(r.count),
    posCount: Number(r.posCount),
    neuCount: Number(r.neuCount),
    negCount: Number(r.negCount),
  }));

  const topTheme = topThemes[0] || { name: 'Onboarding & Activation', count: 0 };

  // 4. Channel Breakdown
  const channelBreakdownRes = await client.execute({
    sql: `SELECT f.channel, COUNT(*) as count 
          FROM feedback f 
          WHERE f.workspaceId = ? AND f.createdAt >= ?
          GROUP BY f.channel
          ORDER BY count DESC`,
    args: [workspaceId, currentStartDate],
  });
  const channelBreakdown = channelBreakdownRes.rows.map((r: any) => ({
    channel: String(r.channel),
    count: Number(r.count),
  }));

  return {
    kpi: {
      totalFeedback: {
        value: totalCount,
        growth: totalGrowth,
        periodLabel: `vs previous ${days} days`,
      },
      negativeRate: {
        value: negPct,
        growth: negPctDelta,
        periodLabel: `${negCount} critical complaints`,
      },
      newThisWeek: {
        value: newThisWeekCount,
        label: 'In the last 7 days',
      },
      topTheme: {
        name: topTheme.name,
        count: topTheme.count,
        label: `${topThemes.length} active themes tracked`,
      },
    },
    sentimentBreakdown: {
      positive: { count: posCount, percentage: posPct },
      neutral: { count: neuCount, percentage: neuPct },
      negative: { count: negCount, percentage: negPct },
      total: totalCount,
    },
    volumeOverTime,
    topThemes,
    channelBreakdown,
  };
}

export async function getThemesTrendData(workspaceId: string, days: number = 30) {
  const nowMs = Date.now();
  const currentStart = new Date(nowMs - days * 86400000).toISOString();
  const prevStart = new Date(nowMs - 2 * days * 86400000).toISOString();

  // Get all themes for this workspace
  const themesRes = await client.execute({
    sql: `SELECT id, name, description, color FROM themes WHERE workspaceId = ? ORDER BY name ASC`,
    args: [workspaceId],
  });

  const themes = themesRes.rows;
  const themeTrends = [];

  for (const t of themes) {
    const themeId = String(t.id);

    // Current period counts
    const currentRes = await client.execute({
      sql: `SELECT COUNT(*) as count,
                   SUM(CASE WHEN f.sentiment = 'POS' THEN 1 ELSE 0 END) as pos,
                   SUM(CASE WHEN f.sentiment = 'NEU' THEN 1 ELSE 0 END) as neu,
                   SUM(CASE WHEN f.sentiment = 'NEG' THEN 1 ELSE 0 END) as neg
            FROM feedback_themes ft
            JOIN feedback f ON ft.feedbackId = f.id
            WHERE ft.themeId = ? AND f.workspaceId = ? AND f.createdAt >= ?`,
      args: [themeId, workspaceId, currentStart],
    });

    // Previous period count
    const prevRes = await client.execute({
      sql: `SELECT COUNT(*) as count
            FROM feedback_themes ft
            JOIN feedback f ON ft.feedbackId = f.id
            WHERE ft.themeId = ? AND f.workspaceId = ? AND f.createdAt >= ? AND f.createdAt < ?`,
      args: [themeId, workspaceId, prevStart, currentStart],
    });

    const currentCount = Number(currentRes.rows[0]?.count || 0);
    const prevCount = Number(prevRes.rows[0]?.count || 0);
    const pos = Number(currentRes.rows[0]?.pos || 0);
    const neu = Number(currentRes.rows[0]?.neu || 0);
    const neg = Number(currentRes.rows[0]?.neg || 0);

    const growth = prevCount === 0 ? (currentCount > 0 ? 100 : 0) : Math.round(((currentCount - prevCount) / prevCount) * 100);

    let trendStatus: 'Spiking' | 'Growing' | 'Stable' | 'Declining' = 'Stable';
    if (growth >= 40 && currentCount >= 4) {
      trendStatus = 'Spiking';
    } else if (growth > 10) {
      trendStatus = 'Growing';
    } else if (growth < -15) {
      trendStatus = 'Declining';
    }

    const totalSafe = Math.max(currentCount, 1);
    const negPercentage = Math.round((neg / totalSafe) * 100);
    const posPercentage = Math.round((pos / totalSafe) * 100);

    themeTrends.push({
      id: themeId,
      name: String(t.name),
      description: String(t.description),
      color: String(t.color || '#6366f1'),
      feedbackCount: currentCount,
      previousCount: prevCount,
      positiveCount: pos,
      neutralCount: neu,
      negativeCount: neg,
      positivePercentage: posPercentage,
      negativePercentage: negPercentage,
      growth,
      trendStatus,
    });
  }

  // Sort by feedback count descending
  themeTrends.sort((a, b) => b.feedbackCount - a.feedbackCount);

  // Spiking themes
  const spikingThemes = themeTrends
    .filter((t) => t.trendStatus === 'Spiking' || t.growth >= 30)
    .slice(0, 4);

  return {
    themes: themeTrends,
    spikingThemes,
  };
}
