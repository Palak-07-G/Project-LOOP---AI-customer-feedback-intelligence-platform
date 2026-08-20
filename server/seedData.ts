import bcrypt from 'bcryptjs';
import { client } from './db';
import { generateSimpleEmbedding } from './ai';

export async function seedDemoData() {
  const passwordHash = await bcrypt.hash('LoopDemo@2026!', 10);
  const now = new Date().toISOString();

  // 1. Create Demo Workspace (Acme Product Labs)
  const acmeWsId = 'ws-acme-prod-labs';
  await client.execute({
    sql: `INSERT OR REPLACE INTO workspaces (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
    args: [acmeWsId, 'Acme Product Labs', now, now],
  });

  // 2. Create Users
  const users = [
    {
      id: 'usr-admin-1',
      name: 'Sarah Chen (Admin)',
      email: 'admin@demo.loop',
      role: 'ADMIN',
      workspaceId: acmeWsId,
    },
    {
      id: 'usr-analyst-1',
      name: 'Marcus Vance (Analyst)',
      email: 'analyst@demo.loop',
      role: 'ANALYST',
      workspaceId: acmeWsId,
    },
    {
      id: 'usr-viewer-1',
      name: 'Elena Rostova (Viewer)',
      email: 'viewer@demo.loop',
      role: 'VIEWER',
      workspaceId: acmeWsId,
    },
  ];

  for (const u of users) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO users (id, name, email, passwordHash, role, workspaceId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [u.id, u.name, u.email, passwordHash, u.role, u.workspaceId, now, now],
    });
  }

  // 3. Create Isolation Test Workspace (Globex Systems)
  const globexWsId = 'ws-globex-sys';
  await client.execute({
    sql: `INSERT OR REPLACE INTO workspaces (id, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
    args: [globexWsId, 'Globex Systems', now, now],
  });
  await client.execute({
    sql: `INSERT OR REPLACE INTO users (id, name, email, passwordHash, role, workspaceId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: ['usr-globex-admin', 'Arthur Dent', 'admin@globex.io', passwordHash, 'ADMIN', globexWsId, now, now],
  });

  // 4. Create Themes for Acme
  const themes = [
    { id: 'thm-onboarding', name: 'Onboarding & Activation', description: 'User friction during initial setup, workspace invites, and tutorial flows.', color: '#6366f1' },
    { id: 'thm-sso', name: 'SSO & Authentication', description: 'SAML/Okta enterprise login, 2FA, session timeout, and password recovery.', color: '#8b5cf6' },
    { id: 'thm-billing', name: 'Billing & Invoicing', description: 'Credit card renewals, invoice VAT receipts, seat tier upgrades, and charge discrepancies.', color: '#ec4899' },
    { id: 'thm-performance', name: 'Performance & Latency', description: 'Dashboard query response times, slow page loads, and bulk action timeouts.', color: '#f43f5e' },
    { id: 'thm-mobile', name: 'Mobile Experience', description: 'iOS and Android app navigation, push notifications, and responsive touch gestures.', color: '#f97316' },
    { id: 'thm-integrations', name: 'Slack & Webhook Integrations', description: 'Slack channel notifications, custom webhook payloads, Jira syncing, and Zapier triggers.', color: '#06b6d4' },
    { id: 'thm-export', name: 'Export & Reporting', description: 'CSV/Excel automated downloads, PDF export layout, and scheduled email reports.', color: '#10b981' },
    { id: 'thm-search', name: 'Search & Navigation', description: 'Global command palette search, nested folder discoverability, and keyword filtering.', color: '#3b82f6' },
    { id: 'thm-pricing', name: 'Pricing & Packaging', description: 'Seat minimums, transparent tier limits, add-on costs, and startup discount requests.', color: '#eab308' },
    { id: 'thm-support', name: 'Customer Support & Docs', description: 'Support agent response speed, API developer documentation clarity, and onboarding video guides.', color: '#14b8a6' },
  ];

  for (const t of themes) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO themes (id, name, description, color, workspaceId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [t.id, t.name, t.description, t.color, acmeWsId, now, now],
    });
  }

  // Create 1 theme for Globex to test tenant boundaries
  await client.execute({
    sql: `INSERT OR REPLACE INTO themes (id, name, description, color, workspaceId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: ['thm-globex-1', 'Globex Hardware Logistics', 'Internal hardware shipment feedback.', '#64748b', globexWsId, now, now],
  });

  // 5. Generate 130+ Realistic Feedback Items for Acme
  const feedbackSeedList: Array<{
    content: string;
    channel: string;
    sourceRef: string;
    customerLabel: string;
    sentiment: 'POS' | 'NEU' | 'NEG';
    sentimentScore: number;
    featureArea: string;
    status: 'NEW' | 'REVIEWED' | 'ACTIONED';
    daysAgo: number;
    themeIds: string[];
  }> = [
    // Onboarding & Setup
    {
      content: "Inviting team members during workspace setup is confusing. Several invitations ended up in spam and there was no resend button.",
      channel: "Support Ticket",
      sourceRef: "TICKET-8921",
      customerLabel: "Enterprise #104 (Fintech)",
      sentiment: "NEG",
      sentimentScore: -0.78,
      featureArea: "Onboarding",
      status: "NEW",
      daysAgo: 2,
      themeIds: ["thm-onboarding"],
    },
    {
      content: "The initial quickstart checklist helped our team get configured in under 15 minutes. Very intuitive first impression!",
      channel: "NPS Survey",
      sourceRef: "NPS-2026-881",
      customerLabel: "Growth Tier #442",
      sentiment: "POS",
      sentimentScore: 0.86,
      featureArea: "Onboarding",
      status: "REVIEWED",
      daysAgo: 3,
      themeIds: ["thm-onboarding"],
    },
    {
      content: "Setup wizard forced me to enter credit card details before I could even invite a colleague to preview the product.",
      channel: "App Store Review",
      sourceRef: "APPSTORE-v4.2-99",
      customerLabel: "Trial User #9182",
      sentiment: "NEG",
      sentimentScore: -0.65,
      featureArea: "Onboarding",
      status: "NEW",
      daysAgo: 5,
      themeIds: ["thm-onboarding", "thm-billing"],
    },
    {
      content: "We need an option to bulk upload teammates via CSV or domain auto-join. Manually typing 40 emails was painful.",
      channel: "Sales Call",
      sourceRef: "SALES-GONG-391",
      customerLabel: "Pipeline Lead: Stripe Partner",
      sentiment: "NEU",
      sentimentScore: -0.22,
      featureArea: "Onboarding",
      status: "ACTIONED",
      daysAgo: 7,
      themeIds: ["thm-onboarding"],
    },
    {
      content: "Tutorial videos inside the onboarding drawer are outdated. The buttons shown in the video don't match the new UI.",
      channel: "Support Ticket",
      sourceRef: "TICKET-8840",
      customerLabel: "MidMarket #302",
      sentiment: "NEG",
      sentimentScore: -0.55,
      featureArea: "Onboarding",
      status: "REVIEWED",
      daysAgo: 10,
      themeIds: ["thm-onboarding", "thm-support"],
    },
    {
      content: "The self-serve guided walkthrough is genuinely the best onboarding UX I have seen in B2B software.",
      channel: "Community Post",
      sourceRef: "COMMUNITY-THREAD-402",
      customerLabel: "Product Lead @ Linear fan",
      sentiment: "POS",
      sentimentScore: 0.92,
      featureArea: "Onboarding",
      status: "ACTIONED",
      daysAgo: 14,
      themeIds: ["thm-onboarding"],
    },

    // SSO & Authentication
    {
      content: "Okta SAML SSO connection fails with a 401 error whenever our corporate identity provider certificate rotates.",
      channel: "Support Ticket",
      sourceRef: "TICKET-9012",
      customerLabel: "Fortune 500 #12",
      sentiment: "NEG",
      sentimentScore: -0.89,
      featureArea: "Authentication",
      status: "NEW",
      daysAgo: 1,
      themeIds: ["thm-sso"],
    },
    {
      content: "Would love Google Workspace one-click login and Google Authenticator 2FA support for non-enterprise tiers.",
      channel: "NPS Survey",
      sourceRef: "NPS-2026-904",
      customerLabel: "Scale Tier #210",
      sentiment: "NEU",
      sentimentScore: 0.15,
      featureArea: "Authentication",
      status: "NEW",
      daysAgo: 4,
      themeIds: ["thm-sso"],
    },
    {
      content: "Session tokens expire too aggressively after 15 minutes of inactivity. I have to re-authenticate multiple times a day.",
      channel: "CSAT Survey",
      sourceRef: "CSAT-984",
      customerLabel: "Power Analyst #44",
      sentiment: "NEG",
      sentimentScore: -0.71,
      featureArea: "Authentication",
      status: "REVIEWED",
      daysAgo: 8,
      themeIds: ["thm-sso"],
    },
    {
      content: "Role-based permission enforcement with Admin, Analyst, and Viewer tiers works flawlessly for our compliance audit.",
      channel: "Sales Call",
      sourceRef: "SALES-GONG-409",
      customerLabel: "Fintech Security Officer",
      sentiment: "POS",
      sentimentScore: 0.88,
      featureArea: "Authentication",
      status: "ACTIONED",
      daysAgo: 12,
      themeIds: ["thm-sso"],
    },

    // Performance & Latency
    {
      content: "Dashboard queries are taking over 8 seconds to render when filtering across more than 5,000 feedback records.",
      channel: "Support Ticket",
      sourceRef: "TICKET-9140",
      customerLabel: "Enterprise #89",
      sentiment: "NEG",
      sentimentScore: -0.84,
      featureArea: "Performance",
      status: "NEW",
      daysAgo: 1,
      themeIds: ["thm-performance"],
    },
    {
      content: "Page transition speeds are lightning fast now. Noticeable improvement compared to the last quarter release!",
      channel: "Community Post",
      sourceRef: "COMMUNITY-899",
      customerLabel: "Early Adopter #09",
      sentiment: "POS",
      sentimentScore: 0.81,
      featureArea: "Performance",
      status: "REVIEWED",
      daysAgo: 6,
      themeIds: ["thm-performance"],
    },
    {
      content: "Bulk status change on 50+ items caused the browser tab to freeze for 10 seconds. Needs optimistic UI updates.",
      channel: "CSAT Survey",
      sourceRef: "CSAT-901",
      customerLabel: "Operations Manager #55",
      sentiment: "NEG",
      sentimentScore: -0.68,
      featureArea: "Performance",
      status: "NEW",
      daysAgo: 9,
      themeIds: ["thm-performance"],
    },
    {
      content: "Search autocomplete lags on Firefox when typing fast. Chrome seems okay but Firefox has high CPU usage.",
      channel: "Support Ticket",
      sourceRef: "TICKET-8730",
      customerLabel: "Developer User #118",
      sentiment: "NEG",
      sentimentScore: -0.49,
      featureArea: "Performance",
      status: "ACTIONED",
      daysAgo: 16,
      themeIds: ["thm-performance", "thm-search"],
    },

    // Billing & Invoicing
    {
      content: "We were double billed for adding 3 analyst seats mid-billing cycle. Please refund the duplicate invoice charge.",
      channel: "Support Ticket",
      sourceRef: "TICKET-9188",
      customerLabel: "SaaS Studio #812",
      sentiment: "NEG",
      sentimentScore: -0.92,
      featureArea: "Billing",
      status: "NEW",
      daysAgo: 2,
      themeIds: ["thm-billing"],
    },
    {
      content: "Need custom VAT/tax ID support printed directly on monthly billing PDF receipts for European tax filing.",
      channel: "NPS Survey",
      sourceRef: "NPS-2026-920",
      customerLabel: "Germany GmbH #302",
      sentiment: "NEU",
      sentimentScore: -0.10,
      featureArea: "Billing",
      status: "REVIEWED",
      daysAgo: 4,
      themeIds: ["thm-billing"],
    },
    {
      content: "Automatic annual discount calculation and self-serve tier upgrade worked seamlessly.",
      channel: "CSAT Survey",
      sourceRef: "CSAT-934",
      customerLabel: "Founder #201",
      sentiment: "POS",
      sentimentScore: 0.79,
      featureArea: "Billing",
      status: "ACTIONED",
      daysAgo: 11,
      themeIds: ["thm-billing"],
    },
    {
      content: "Cannot downgrade seat count without emailing support directly. There should be a self-serve toggle in billing settings.",
      channel: "App Store Review",
      sourceRef: "APPSTORE-v4.1-12",
      customerLabel: "Small Business #99",
      sentiment: "NEG",
      sentimentScore: -0.62,
      featureArea: "Billing",
      status: "REVIEWED",
      daysAgo: 19,
      themeIds: ["thm-billing"],
    },

    // Mobile Experience
    {
      content: "iOS app crashes whenever opening a Voice-of-Customer report with embedded charts. Please fix iOS 18 compatibility.",
      channel: "App Store Review",
      sourceRef: "APPSTORE-v4.3-01",
      customerLabel: "Mobile Exec #44",
      sentiment: "NEG",
      sentimentScore: -0.88,
      featureArea: "Mobile",
      status: "NEW",
      daysAgo: 3,
      themeIds: ["thm-mobile", "thm-export"],
    },
    {
      content: "Push notifications on mobile for high-urgency negative customer feedback are super handy for our on-call PMs.",
      channel: "Community Post",
      sourceRef: "COMMUNITY-944",
      customerLabel: "Product Lead @ RapidScale",
      sentiment: "POS",
      sentimentScore: 0.85,
      featureArea: "Mobile",
      status: "ACTIONED",
      daysAgo: 7,
      themeIds: ["thm-mobile"],
    },
    {
      content: "Mobile layout filters menu overflows off-screen on iPhone SE (smaller viewport). Filter pills get cut off.",
      channel: "Support Ticket",
      sourceRef: "TICKET-8950",
      customerLabel: "Designer #102",
      sentiment: "NEG",
      sentimentScore: -0.58,
      featureArea: "Mobile",
      status: "REVIEWED",
      daysAgo: 13,
      themeIds: ["thm-mobile"],
    },

    // Integrations & Webhooks
    {
      content: "Slack webhook integration is fantastic. Our entire product team gets instant digests of newly classified themes.",
      channel: "NPS Survey",
      sourceRef: "NPS-2026-950",
      customerLabel: "Head of Product #88",
      sentiment: "POS",
      sentimentScore: 0.94,
      featureArea: "Integrations",
      status: "ACTIONED",
      daysAgo: 2,
      themeIds: ["thm-integrations"],
    },
    {
      content: "Jira ticket creation from feedback items fails if our Jira project has mandatory custom fields configured.",
      channel: "Support Ticket",
      sourceRef: "TICKET-9210",
      customerLabel: "Agile PM #339",
      sentiment: "NEG",
      sentimentScore: -0.73,
      featureArea: "Integrations",
      status: "NEW",
      daysAgo: 5,
      themeIds: ["thm-integrations"],
    },
    {
      content: "Please add native Zapier and Make.com integrations so we can automatically sync CSAT surveys from Typeform.",
      channel: "Sales Call",
      sourceRef: "SALES-GONG-440",
      customerLabel: "Growth Lead @ Fintech",
      sentiment: "NEU",
      sentimentScore: 0.20,
      featureArea: "Integrations",
      status: "REVIEWED",
      daysAgo: 15,
      themeIds: ["thm-integrations"],
    },

    // Export & Reporting
    {
      content: "The automated Voice-of-Customer PDF export saved me 4 hours of slide prep for our executive quarterly review!",
      channel: "Community Post",
      sourceRef: "COMMUNITY-982",
      customerLabel: "VP Product @ Hyperion",
      sentiment: "POS",
      sentimentScore: 0.95,
      featureArea: "Reporting",
      status: "ACTIONED",
      daysAgo: 1,
      themeIds: ["thm-export"],
    },
    {
      content: "CSV export is stripping newline characters inside customer quotes, causing multi-line feedback to break formatting in Excel.",
      channel: "Support Ticket",
      sourceRef: "TICKET-9088",
      customerLabel: "Data Scientist #17",
      sentiment: "NEG",
      sentimentScore: -0.64,
      featureArea: "Reporting",
      status: "NEW",
      daysAgo: 4,
      themeIds: ["thm-export"],
    },
    {
      content: "Would love scheduled weekly email delivery of the top spiking customer complaint themes directly to my inbox.",
      channel: "NPS Survey",
      sourceRef: "NPS-2026-965",
      customerLabel: "Director of UX #50",
      sentiment: "POS",
      sentimentScore: 0.65,
      featureArea: "Reporting",
      status: "REVIEWED",
      daysAgo: 8,
      themeIds: ["thm-export"],
    },

    // Search & Navigation
    {
      content: "Command+K search is super snappy. Being able to jump directly to any theme or feedback ID is a gamechanger.",
      channel: "Community Post",
      sourceRef: "COMMUNITY-999",
      customerLabel: "Tech Lead #404",
      sentiment: "POS",
      sentimentScore: 0.91,
      featureArea: "Search",
      status: "ACTIONED",
      daysAgo: 3,
      themeIds: ["thm-search"],
    },
    {
      content: "Boolean search operators (AND / OR / NOT) don't seem to work in the inbox search bar. It matches literally.",
      channel: "Support Ticket",
      sourceRef: "TICKET-8899",
      customerLabel: "Analyst #77",
      sentiment: "NEU",
      sentimentScore: -0.15,
      featureArea: "Search",
      status: "REVIEWED",
      daysAgo: 12,
      themeIds: ["thm-search"],
    },

    // Pricing & Packaging
    {
      content: "The 10-seat minimum for the enterprise tier is too steep for our 6-person startup. We need a flexible seat tier.",
      channel: "Sales Call",
      sourceRef: "SALES-GONG-451",
      customerLabel: "Seed Startup Founder",
      sentiment: "NEG",
      sentimentScore: -0.58,
      featureArea: "Pricing",
      status: "NEW",
      daysAgo: 6,
      themeIds: ["thm-pricing"],
    },
    {
      content: "Pricing is extremely fair compared to Enterprisey competitors like Medallia or Qualtrics. Clear ROI in week one.",
      channel: "NPS Survey",
      sourceRef: "NPS-2026-978",
      customerLabel: "Head of CS #12",
      sentiment: "POS",
      sentimentScore: 0.89,
      featureArea: "Pricing",
      status: "ACTIONED",
      daysAgo: 10,
      themeIds: ["thm-pricing"],
    },

    // Customer Support & Docs
    {
      content: "Support team resolved our webhook API payload issue within 12 minutes on live chat. Truly world class support!",
      channel: "CSAT Survey",
      sourceRef: "CSAT-990",
      customerLabel: "Developer Lead #80",
      sentiment: "POS",
      sentimentScore: 0.96,
      featureArea: "Support",
      status: "ACTIONED",
      daysAgo: 2,
      themeIds: ["thm-support"],
    },
    {
      content: "API reference documentation is missing code examples for the Python SDK and pagination cursor parameters.",
      channel: "Community Post",
      sourceRef: "COMMUNITY-1002",
      customerLabel: "Integration Dev #59",
      sentiment: "NEG",
      sentimentScore: -0.51,
      featureArea: "Support",
      status: "REVIEWED",
      daysAgo: 7,
      themeIds: ["thm-support"],
    },
  ];

  // Let's generate additional realistic records spanning 90 days to achieve 135+ data points with rich time-series
  const additionalTopics = [
    {
      channel: 'Support Ticket',
      prefix: 'TICKET-',
      theme: 'thm-onboarding',
      quotes: [
        { text: "Can we customize the welcome email template sent to new workspace members? Our company branding is missing.", score: -0.3, sent: 'NEU' as const, area: 'Onboarding' },
        { text: "Invited 5 users today, all got activated smoothly within minutes. Great improvement over last month.", score: 0.8, sent: 'POS' as const, area: 'Onboarding' },
        { text: "New users are getting stuck on the project creation step because the mandatory workspace dropdown is hidden.", score: -0.72, sent: 'NEG' as const, area: 'Onboarding' },
        { text: "Onboarding tour modal keeps re-appearing on every page refresh even after clicking 'Don't show again'.", score: -0.68, sent: 'NEG' as const, area: 'Onboarding' },
      ]
    },
    {
      channel: 'App Store Review',
      prefix: 'APPSTORE-',
      theme: 'thm-mobile',
      quotes: [
        { text: "Dark mode on iOS looks crisp! Battery drain is also significantly lower after the v4.3 update.", score: 0.88, sent: 'POS' as const, area: 'Mobile' },
        { text: "Biometric FaceID login occasionally hangs on splash screen requiring force close.", score: -0.61, sent: 'NEG' as const, area: 'Mobile' },
        { text: "Love being able to triage customer feedback during my morning train commute. Smooth UI.", score: 0.84, sent: 'POS' as const, area: 'Mobile' },
        { text: "Offline mode doesn't cache recent feedback records. If internet drops, app shows empty screen.", score: -0.55, sent: 'NEG' as const, area: 'Mobile' },
      ]
    },
    {
      channel: 'NPS Survey',
      prefix: 'NPS-2026-',
      theme: 'thm-performance',
      quotes: [
        { text: "Speed of Ask LOOP semantic search is astonishing. Generates cited answers in under 2 seconds.", score: 0.94, sent: 'POS' as const, area: 'Performance' },
        { text: "Initial dashboard load takes longer when there are over 10 active theme filters selected.", score: -0.42, sent: 'NEG' as const, area: 'Performance' },
        { text: "CSV import with 1,000 rows processed in just 4 seconds without freezing the UI. Excellent.", score: 0.89, sent: 'POS' as const, area: 'Performance' },
        { text: "Filter dropdown lags when scrolling quickly through 50+ channel options.", score: -0.38, sent: 'NEU' as const, area: 'Performance' },
      ]
    },
    {
      channel: 'CSAT Survey',
      prefix: 'CSAT-',
      theme: 'thm-billing',
      quotes: [
        { text: "Self-serve credit card update failed with generic card error. Bank said no decline was sent.", score: -0.74, sent: 'NEG' as const, area: 'Billing' },
        { text: "Appreciated the 14-day renewal notice email before our annual enterprise contract renewed.", score: 0.76, sent: 'POS' as const, area: 'Billing' },
        { text: "Why is there no option to pay via ACH direct debit for invoices over $10,000?", score: -0.45, sent: 'NEU' as const, area: 'Billing' },
        { text: "Billing history dashboard clearly displays itemized seat charges and discounts.", score: 0.82, sent: 'POS' as const, area: 'Billing' },
      ]
    },
    {
      channel: 'Sales Call',
      prefix: 'SALES-GONG-',
      theme: 'thm-sso',
      quotes: [
        { text: "Enterprise prospect requires Microsoft Entra ID (Azure AD) SCIM auto-provisioning for 500 seats.", score: 0.1, sent: 'NEU' as const, area: 'Authentication' },
        { text: "Security review approved immediately thanks to SOC2 compliance and strict workspace data isolation.", score: 0.95, sent: 'POS' as const, area: 'Authentication' },
        { text: "Lost a prospect because we didn't support IP allowlisting for enterprise login portals.", score: -0.65, sent: 'NEG' as const, area: 'Authentication' },
        { text: "Customer loved that Viewer roles have zero write permissions, making compliance audits simple.", score: 0.9, sent: 'POS' as const, area: 'Authentication' },
      ]
    },
    {
      channel: 'Community Post',
      prefix: 'COMMUNITY-',
      theme: 'thm-integrations',
      quotes: [
        { text: "Built a custom Discord bot using LOOP's webhook dispatch. Real-time feedback alerts work like magic!", score: 0.92, sent: 'POS' as const, area: 'Integrations' },
        { text: "Webhook payload is missing the customerLabel field when triggered on status change.", score: -0.48, sent: 'NEG' as const, area: 'Integrations' },
        { text: "GitHub issue auto-linking when tagging feedback with 'Bug' saved our dev team hours.", score: 0.87, sent: 'POS' as const, area: 'Integrations' },
        { text: "Please add Microsoft Teams bot integration alongside the Slack app.", score: 0.2, sent: 'NEU' as const, area: 'Integrations' },
      ]
    },
    {
      channel: 'Support Ticket',
      prefix: 'TICKET-',
      theme: 'thm-export',
      quotes: [
        { text: "Executive VoC PDF summary with trend spikes was a massive hit in our board meeting yesterday.", score: 0.96, sent: 'POS' as const, area: 'Reporting' },
        { text: "Need the ability to filter exported CSV by customerLabel prefix (e.g. only Enterprise accounts).", score: -0.15, sent: 'NEU' as const, area: 'Reporting' },
        { text: "Chart colors in PDF export are washed out when printed in monochrome grayscale.", score: -0.4, sent: 'NEG' as const, area: 'Reporting' },
        { text: "Scheduled weekly automated reports are delivering on time every Monday morning.", score: 0.85, sent: 'POS' as const, area: 'Reporting' },
      ]
    },
    {
      channel: 'CSAT Survey',
      prefix: 'CSAT-',
      theme: 'thm-search',
      quotes: [
        { text: "Natural language query in Ask LOOP accurately found all feedback mentioning 'pricing friction'.", score: 0.93, sent: 'POS' as const, area: 'Search' },
        { text: "Search box resets every time I click back from a feedback detail drawer.", score: -0.52, sent: 'NEG' as const, area: 'Search' },
        { text: "Regex search support would be great for finding technical error codes in crash logs.", score: 0.05, sent: 'NEU' as const, area: 'Search' },
        { text: "Theme auto-filter when clicking a badge in search results makes navigation super smooth.", score: 0.88, sent: 'POS' as const, area: 'Search' },
      ]
    },
  ];

  // Expand into a rich dataset of 130 items with realistic dates over the last 90 days
  let itemIndex = 1;
  const statuses: Array<'NEW' | 'REVIEWED' | 'ACTIONED'> = ['NEW', 'REVIEWED', 'ACTIONED'];

  for (const item of feedbackSeedList) {
    const feedbackId = `fb-seed-${itemIndex++}`;
    const date = new Date(Date.now() - item.daysAgo * 86400000).toISOString();

    await client.execute({
      sql: `INSERT OR REPLACE INTO feedback (id, content, channel, sourceRef, customerLabel, sentiment, sentimentScore, featureArea, status, createdAt, updatedAt, workspaceId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        feedbackId,
        item.content,
        item.channel,
        item.sourceRef,
        item.customerLabel,
        item.sentiment,
        item.sentimentScore,
        item.featureArea,
        item.status,
        date,
        date,
        acmeWsId,
      ],
    });

    for (const themeId of item.themeIds) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO feedback_themes (feedbackId, themeId, confidence) VALUES (?, ?, ?)`,
        args: [feedbackId, themeId, 0.95],
      });
    }

    // Insert deterministic embedding vector
    const vector = generateSimpleEmbedding(item.content);
    await client.execute({
      sql: `INSERT OR REPLACE INTO embeddings (id, feedbackId, vector, createdAt) VALUES (?, ?, ?, ?)`,
      args: [`emb-${feedbackId}`, feedbackId, JSON.stringify(vector), date],
    });
  }

  // Generate the remaining 100+ items across 90 days
  for (let cycle = 0; cycle < 13; cycle++) {
    for (const topic of additionalTopics) {
      for (let qIdx = 0; qIdx < topic.quotes.length; qIdx++) {
        const q = topic.quotes[qIdx];
        const daysAgo = Math.floor(Math.random() * 85) + 1;
        const feedbackId = `fb-seed-${itemIndex++}`;
        const date = new Date(Date.now() - daysAgo * 86400000).toISOString();
        const status = statuses[itemIndex % statuses.length];
        const customerNum = 100 + (itemIndex * 7) % 890;
        const customerLabel = itemIndex % 3 === 0 ? `Enterprise #${customerNum}` : itemIndex % 2 === 0 ? `Pro #${customerNum}` : `User #${customerNum}`;

        await client.execute({
          sql: `INSERT OR REPLACE INTO feedback (id, content, channel, sourceRef, customerLabel, sentiment, sentimentScore, featureArea, status, createdAt, updatedAt, workspaceId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            feedbackId,
            q.text,
            topic.channel,
            `${topic.prefix}${9000 + itemIndex}`,
            customerLabel,
            q.sent,
            q.score,
            q.area,
            status,
            date,
            date,
            acmeWsId,
          ],
        });

        await client.execute({
          sql: `INSERT OR REPLACE INTO feedback_themes (feedbackId, themeId, confidence) VALUES (?, ?, ?)`,
          args: [feedbackId, topic.theme, 0.92],
        });

        const vector = generateSimpleEmbedding(q.text);
        await client.execute({
          sql: `INSERT OR REPLACE INTO embeddings (id, feedbackId, vector, createdAt) VALUES (?, ?, ?, ?)`,
          args: [`emb-${feedbackId}`, feedbackId, JSON.stringify(vector), date],
        });
      }
    }
  }

  // 6. Seed a sample Voice-of-Customer Report for Acme
  const sampleReportContent = {
    executiveSummary: "Customer sentiment across Acme Product Labs remains strongly positive overall (68% positive), driven by love for Slack/webhook integrations, lightning-fast semantic Ask LOOP, and executive VoC reporting. However, a significant spike in negative feedback (+42%) was detected in Onboarding & SSO over the past 30 days due to team invite friction and Okta certificate rotation issues.",
    period: "Last 30 Days",
    totalFeedbackAnalyzed: 118,
    sentimentBreakdown: { positive: 68, neutral: 14, negative: 18 },
    topThemes: [
      { name: "Onboarding & Activation", count: 32, sentiment: "45% Negative (Spiking)", growth: "+42%" },
      { name: "SSO & Authentication", count: 24, sentiment: "52% Negative", growth: "+74%" },
      { name: "Slack & Webhook Integrations", count: 22, sentiment: "91% Positive", growth: "+18%" },
      { name: "Export & Reporting", count: 18, sentiment: "84% Positive", growth: "+12%" },
      { name: "Performance & Latency", count: 14, sentiment: "70% Positive", growth: "-8%" },
    ],
    whatCustomersLove: [
      "Instant Slack digests of incoming customer insights allow product teams to act within minutes.",
      "Ask LOOP retrieval RAG answers high-level user sentiment questions with verifiable citations.",
      "Executive PDF export format saves product leaders hours of manual deck preparation.",
    ],
    whatCustomersStruggleWith: [
      "Team member invitation emails occasionally land in spam folders with no in-app resend trigger.",
      "Okta SAML SSO certificate rotations cause transient 401 authentication errors.",
      "Double-billing edge cases when upgrading seats mid-month without prorated calculation.",
    ],
    emergingTrends: [
      "Rising requests for Microsoft Entra ID (Azure AD) and SCIM automated user provisioning.",
      "Growing demand for mobile offline caching and iPad-optimized tablet layouts.",
    ],
    keyQuotes: [
      { quote: "Inviting team members during setup is confusing. Several invitations ended up in spam.", customer: "Enterprise #104", channel: "Support Ticket" },
      { quote: "The automated Voice-of-Customer PDF export saved me 4 hours of slide prep for our executive quarterly review!", customer: "VP Product @ Hyperion", channel: "Community Post" },
      { quote: "Okta SAML SSO connection fails with a 401 error whenever our certificate rotates.", customer: "Fortune 500 #12", channel: "Support Ticket" },
    ],
    priorityRecommendations: [
      {
        priority: "Priority 1 (Urgent)",
        theme: "Onboarding & Team Invitations",
        action: "Add an in-app 'Resend Invitation' button, copyable invite link, and domain auto-join toggle.",
        impact: "Reduces onboarding support tickets by estimated 35%."
      },
      {
        priority: "Priority 2 (High)",
        theme: "SSO & SAML Certificate Auto-Sync",
        action: "Implement automated metadata polling for Okta and Entra ID to prevent 401 outages during cert rotation.",
        impact: "Protects high-value enterprise renewals."
      },
      {
        priority: "Priority 3 (Medium)",
        theme: "Self-Serve Billing Proration",
        action: "Provide real-time proration preview before seat changes and add VAT ID fields on receipts.",
        impact: "Eliminates billing friction for EU and mid-market accounts."
      }
    ]
  };

  const reportId = 'rep-sample-voc-1';
  const startPeriod = new Date(Date.now() - 30 * 86400000).toISOString();
  await client.execute({
    sql: `INSERT OR REPLACE INTO reports (id, title, periodStart, periodEnd, contentJson, createdAt, generatedBy, workspaceId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      reportId,
      'Executive VoC Intelligence Digest — Q3 2026',
      startPeriod,
      now,
      JSON.stringify(sampleReportContent),
      now,
      'Sarah Chen (Admin)',
      acmeWsId,
    ],
  });

  // 7. Seed 2 records for Globex to test tenant boundaries
  const globexFbId = 'fb-globex-1';
  await client.execute({
    sql: `INSERT OR REPLACE INTO feedback (id, content, channel, sourceRef, customerLabel, sentiment, sentimentScore, featureArea, status, createdAt, updatedAt, workspaceId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      globexFbId,
      'Globex proprietary logistics hardware shipment was delayed by customs in Rotterdam.',
      'Support Ticket',
      'GLOBEX-TICK-101',
      'Globex Client #01',
      'NEG',
      -0.85,
      'Logistics',
      'NEW',
      now,
      now,
      globexWsId,
    ],
  });
  const globexVector = generateSimpleEmbedding('Globex proprietary logistics hardware shipment was delayed');
  await client.execute({
    sql: `INSERT OR REPLACE INTO embeddings (id, feedbackId, vector, createdAt) VALUES (?, ?, ?, ?)`,
    args: [`emb-${globexFbId}`, globexFbId, JSON.stringify(globexVector), now],
  });
}
