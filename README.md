# LOOP — AI Customer-Feedback Intelligence Platform

> **Close the loop on customer feedback.**

LOOP is an AI-powered customer-feedback intelligence platform that transforms scattered customer feedback into actionable product insights.

It allows teams to collect feedback from multiple sources, automatically classify sentiment and themes, analyze trends, ask natural-language questions about customer feedback, and generate Voice-of-Customer reports.

The application is designed as a corporate-style SaaS product with authentication, role-based access control, workspace-level data isolation, analytics dashboards, AI-powered insights, and report generation.

---

## ✨ Features

### 🔐 Authentication & Workspace Management

* User registration and login
* Secure password hashing
* JWT-based session management
* Persistent sessions using HTTP-only cookies
* Protected API routes
* Workspace-based multi-tenancy
* User roles and permissions

### 👥 Role-Based Access Control

LOOP supports three user roles:

| Role        | Permissions                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------- |
| **Admin**   | Full access, workspace/member management, feedback management, analytics, AI features and reports |
| **Analyst** | Feedback ingestion and management, analytics, AI insights and reports                             |
| **Viewer**  | Read-only access to feedback, analytics, trends and insights                                      |

Authorization is enforced on the server rather than relying only on frontend UI restrictions.

---

## 📥 Feedback Ingestion

LOOP supports multiple methods for adding customer feedback.

### Manual Feedback

Users can add individual feedback records with:

* Feedback content
* Channel
* Customer label
* Source reference
* Creation date

### CSV Import

Bulk feedback can be imported through CSV files.

Expected columns:

```csv
content,channel,customer_label,created_at
```

The importer validates the uploaded data and provides an import summary.

### Simulated Channels

The application includes simulated customer-feedback sources so that the project can demonstrate multi-channel ingestion without requiring real third-party integrations.

Example channels include:

* Support Tickets
* App Store Reviews
* NPS Surveys
* Sales Notes
* Community Posts

---

# 🤖 AI-Powered Intelligence

LOOP's core functionality is built around AI-assisted customer-feedback analysis.

## 1. Automatic Feedback Classification

New feedback can be analyzed automatically to determine:

* Sentiment
* Sentiment score
* Themes
* Feature area
* Classification rationale

Example:

```json
{
  "sentiment": "NEG",
  "sentimentScore": -0.82,
  "themes": [
    "Onboarding & Activation"
  ],
  "featureArea": "Onboarding",
  "rationale": "The customer experienced difficulty during the onboarding process."
}
```

AI responses are validated using **Zod** before being stored.

The application can use:

1. Anthropic Claude
2. Google Gemini
3. A deterministic fallback classification engine

This fallback allows the application to continue demonstrating its core intelligence features even when an external AI API is unavailable.
---
# 📊 Analytics Dashboard

The dashboard provides an overview of customer feedback and product sentiment.

### Key Metrics

* Total feedback
* Negative feedback percentage
* New feedback
* Top themes
* Sentiment information

### Visualizations

LOOP uses Recharts to provide interactive analytics including:

* Feedback volume over time
* Sentiment distribution
* Top customer-feedback themes
* Theme trends

The dashboard is designed to help product teams quickly identify where customer attention is increasing.

---

# 📬 Feedback Inbox

The Feedback Inbox provides a centralized workspace for reviewing customer feedback.

Features include:

* Feedback search
* Filtering
* Pagination
* Sentiment filtering
* Channel filtering
* Theme filtering
* Status management
* Feedback detail view
* AI classification information

Feedback can move through the following workflow:

```text
NEW → REVIEWED → ACTIONED
```

---

# 🧩 Theme Intelligence

LOOP groups customer feedback into meaningful themes.

Themes can represent recurring product areas such as:

* Onboarding
* Billing
* Authentication
* Performance
* Mobile Experience
* Integrations
* Reporting
* Search
* Customer Support

Each theme can be analyzed based on:

* Number of feedback items
* Sentiment
* Growth
* Related feedback
* Historical trends

This allows product teams to identify recurring customer problems instead of reviewing feedback individually.

---

# 📈 Trend Detection

The Trends section helps identify themes that are increasing or decreasing over time.

LOOP compares feedback volumes between time periods to identify changes in customer interest or frustration.

Themes can be categorized as:

* Spiking
* Growing
* Stable
* Declining

Example:

```text
Onboarding & Activation
+42%

Billing & Invoicing
+27%

Mobile Experience
-12%
```

This helps teams prioritize emerging customer problems.

---

# 💬 Ask LOOP

Ask LOOP is the platform's natural-language customer-feedback assistant.

Users can ask questions such as:

> What are customers saying about onboarding?

> What are the biggest complaints this month?

> Which areas are becoming more negative?

> What do customers like about the dashboard?

> What should the product team prioritize?

The system retrieves relevant feedback and uses that information as grounding context for the AI response.

---

## 🔎 Retrieval-Grounded Answers

Ask LOOP follows a retrieval-first architecture.

Conceptually:

```text
User Question
      ↓
Generate Query Representation
      ↓
Retrieve Relevant Feedback
      ↓
Build Evidence Context
      ↓
AI Analysis
      ↓
Grounded Answer
      ↓
Supporting Feedback
```

The AI is instructed not to invent customer feedback or unsupported statistics.

If sufficient evidence cannot be found, LOOP responds that there is not enough evidence to answer confidently.

Responses can reference the feedback records used as evidence.

---

# 📝 Voice-of-Customer Reports

LOOP can generate Voice-of-Customer reports based on selected periods.

Reports can summarize:

### Executive Summary

High-level overview of customer sentiment.

### What Customers Love

Important positive themes and feedback.

### Customer Pain Points

Recurring negative themes.

### Emerging Trends

Themes that are increasing.

### Customer Quotes

Representative feedback from real customer records.

### Recommended Actions

Potential product actions based on the collected evidence.

### Sentiment Overview

Summary of positive, neutral and negative feedback.

Reports are stored so they can be viewed later.

---

# 🏗️ Architecture

LOOP follows a client/server architecture.

```text
┌──────────────────────────────┐
│          React UI            │
│                              │
│  Dashboard                   │
│  Feedback Inbox              │
│  Trends                      │
│  Ask LOOP                    │
│  Reports                     │
│  Settings                    │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│      Express Backend         │
│                              │
│ Authentication               │
│ Authorization                │
│ Feedback APIs                │
│ Analytics APIs               │
│ Theme APIs                   │
│ Insights APIs                │
│ Report APIs                  │
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│   Database   │  │   AI Layer   │
│              │  │              │
│ SQLite/      │  │ Claude       │
│ LibSQL       │  │ Gemini       │
│              │  │ Fallback AI  │
└──────────────┘  └──────────────┘
```

The backend is responsible for:

* Authentication
* Authorization
* Database access
* AI API calls
* Analytics calculations
* Feedback processing
* Report generation

AI API credentials are kept server-side.

---

# 🛠️ Technology Stack

## Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* Recharts
* Lucide React
* Motion

## Backend

* Node.js
* Express
* TypeScript
* JWT
* Cookie Parser

## Database

* SQLite / LibSQL
* Prisma-compatible relational data model

## AI

* Anthropic Claude API
* Google Gemini API
* Zod structured-output validation
* Local deterministic fallback classification

## Data Processing

* Papa Parse for CSV processing

## Security

* bcryptjs for password hashing
* JSON Web Tokens for sessions
* HTTP-only cookies
* Server-side authorization

---

# 📁 Project Structure

```text
loop-feedback-intelligence/
│
├── prisma/
│   └── schema.prisma
│
├── server/
│   ├── db.ts
│   ├── seedData.ts
│   ├── ai.ts
│   ├── auth.ts
│   │
│   └── routes/
│       ├── auth.ts
│       ├── feedback.ts
│       ├── themes.ts
│       ├── analytics.ts
│       ├── insights.ts
│       ├── reports.ts
│       └── members.ts
│
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── feedback/
│   │   └── dashboard/
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── lib/
│   │   └── api.ts
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── InboxPage.tsx
│   │   ├── TrendsPage.tsx
│   │   ├── AskLoopPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── MembersPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── assets/
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── server.ts
└── README.md
```

---

# 🗄️ Data Model

The application uses a relational data model centered around workspaces.

Main entities include:

```text
Workspace
   │
   ├── Users
   │
   ├── Feedback
   │      │
   │      ├── FeedbackTheme
   │      │        │
   │      │        └── Theme
   │      │
   │      └── Embedding
   │
   └── Reports
```

### Workspace

Represents a company/tenant.

### User

Represents a team member belonging to a workspace.

### Feedback

Stores individual customer feedback.

### Theme

Represents recurring customer topics.

### FeedbackTheme

Many-to-many relationship between feedback and themes.

### Embedding

Stores a representation of feedback for semantic similarity retrieval.

### Report

Stores generated Voice-of-Customer reports.

---

# 🔒 Security & Multi-Tenancy

Security is a major part of LOOP's architecture.

Every authenticated request is associated with a workspace.

Tenant-owned database queries are scoped using the authenticated user's `workspaceId`.

Conceptually:

```ts
const session = await requireAuth();

const workspaceId = session.workspaceId;

const feedback = await getFeedback({
  workspaceId
});
```

The frontend cannot simply provide another workspace ID to gain access to another tenant's data.

The server performs authentication and authorization before sensitive operations.

### Security practices

* Passwords are hashed
* Sessions use signed JWTs
* Authentication is required for protected resources
* Authorization is checked server-side
* Workspace isolation is enforced
* AI API keys remain server-side
* Environment variables are used for secrets
* Input validation is performed with Zod

---

# ⚙️ Environment Variables

Create a `.env` file in the project root.

Example:

```env
GEMINI_API_KEY="your-gemini-api-key"

ANTHROPIC_API_KEY="your-anthropic-api-key"

DATABASE_URL="file:./data/loop.db"

AUTH_SECRET="replace-with-a-long-random-secret"

APP_URL="http://localhost:3000"
```

### AI Provider Configuration

LOOP can use Anthropic Claude and/or Google Gemini.

If both are unavailable, the application can fall back to its deterministic local classification engine for core classification functionality.

Never commit real API keys to Git.

---

# 🚀 Getting Started

## Prerequisites

Install:

* Node.js
* npm

Recommended:

```text
Node.js 18+
npm 9+
```

---

## 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
```

Navigate into the project:

```bash
cd loop-feedback-intelligence
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create:

```text
.env
```

Copy the variables from:

```text
.env.example
```

and replace the placeholder values.

---

## 4. Start the development server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

# 📜 Available Scripts

## Development

```bash
npm run dev
```

Starts the Express server and Vite development environment.

---

## Production Build

```bash
npm run build
```

Builds:

* React frontend
* Express backend

---

## Production Start

```bash
npm run start
```

Starts the production server.

---

## TypeScript Check

```bash
npm run lint
```

Runs the TypeScript compiler without emitting files.

---

## 🩺 Health Check

The backend exposes a health endpoint:

```text
GET /api/health
```

A successful response looks like:

```json
{
  "status": "ok",
  "platform": "LOOP Feedback Intelligence"
}
```

---

# 🔌 API Overview

The backend exposes REST endpoints grouped by functionality.

```text
/api/auth
/api/feedback
/api/themes
/api/analytics
/api/insights
/api/reports
/api/members
```

### Authentication

```text
/api/auth
```

Handles:

* registration
* login
* logout
* session management

### Feedback

```text
/api/feedback
```

Handles:

* creating feedback
* retrieving feedback
* updating feedback
* searching
* filtering
* CSV ingestion
* simulated channels
* classification

### Themes

```text
/api/themes
```

Handles theme information and theme-related analysis.

### Analytics

```text
/api/analytics
```

Provides dashboard statistics and chart data.

### Insights

```text
/api/insights
```

Handles Ask LOOP queries and AI-generated insights.

### Reports

```text
/api/reports
```

Handles Voice-of-Customer report generation and retrieval.

### Members

```text
/api/members
```

Handles workspace member management.

---

# 🧠 AI Architecture

LOOP uses a provider-based AI architecture.

```text
                ┌──────────────┐
                │ Feedback     │
                │              │
                └──────┬───────┘
                       │
                       ▼
              ┌─────────────────┐
              │ AI Service      │
              └────────┬────────┘
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
         Claude     Gemini    Fallback
             │         │         │
             └─────────┼─────────┘
                       ▼
              Structured Result
                       │
                       ▼
                  Zod Validation
                       │
                       ▼
                   Database
```

The classification output is validated against a Zod schema before being persisted.

This prevents malformed AI output from silently entering the application's data layer.

---

# 🧪 AI Classification Schema

The application expects classification output in the following structure:

```json
{
  "sentiment": "POS | NEU | NEG",
  "sentimentScore": -1,
  "themes": [],
  "featureArea": "string",
  "rationale": "string"
}
```

### Sentiment score

The score ranges from:

```text
-1.0 → Extremely Negative

 0.0 → Neutral

+1.0 → Extremely Positive
```

---

# 🔎 Ask LOOP Architecture

Ask LOOP uses a retrieval-grounded approach rather than simply asking an LLM to answer from general knowledge.

```text
Question
   ↓
Query embedding / representation
   ↓
Semantic similarity search
   ↓
Relevant feedback
   ↓
Evidence context
   ↓
Claude / Gemini
   ↓
Grounded answer
   ↓
Evidence references
```

The AI is instructed to answer only using retrieved customer feedback.

If sufficient evidence is unavailable, the assistant should explicitly state that the available feedback is insufficient.

---

# 📊 Analytics Architecture

Dashboard metrics are calculated from actual feedback data.

The application provides:

* Total feedback count
* Sentiment distribution
* Feedback volume
* Theme frequency
* Theme trends
* Channel breakdown
* Date-based analysis

Charts are rendered using Recharts.

---

# 🎨 UI & UX

LOOP is designed as a modern B2B SaaS application.

The interface focuses on:

* Clear information hierarchy
* Responsive layouts
* Reusable UI components
* Consistent cards and badges
* Interactive charts
* Feedback detail drawers
* Loading states
* Empty states
* Error handling
* Accessible controls

Major application screens include:

```text
Landing
Login
Signup
Dashboard
Feedback Inbox
Trends
Ask LOOP
Reports
Members
Settings
```

---

# 📱 Responsive Design

The interface is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile

The application includes a responsive navigation system and adapts dashboards, tables, filters and reports for smaller screens.

---

# 🌱 Seed / Demo Data

The application includes seeded customer-feedback data for demonstration purposes.

The seed dataset contains realistic feedback across multiple channels and product areas so that:

* Dashboard charts have meaningful data
* Themes can be analyzed
* Sentiment trends can be demonstrated
* Ask LOOP has evidence to retrieve
* Reports have meaningful source material

This makes the application immediately demonstrable without requiring a user to manually enter hundreds of feedback records.

---

# 🧑‍💻 Development Guidelines

When contributing to LOOP:

### Use TypeScript

Prefer explicit types instead of:

```ts
any
```

### Validate external input

Use Zod for:

* API requests
* AI responses
* user input
* imported data

### Keep business logic server-side

Do not put database or AI provider logic directly inside React components.

### Protect tenant data

Every tenant-owned database operation should use the authenticated workspace.

### Protect secrets

Never commit:

```text
.env
.env.local
API keys
database credentials
authentication secrets
```

---

# 🗂️ Recommended Git Workflow

Use feature-oriented commits.

Examples:

```text
feat: add authentication
feat: implement workspace isolation
feat: add feedback ingestion
feat: add CSV import
feat: add analytics dashboard
feat: integrate AI classification
feat: add theme trends
feat: implement Ask LOOP
feat: add Voice-of-Customer reports
fix: improve feedback filtering
fix: handle AI classification errors
docs: update README
```

Avoid a single commit containing the entire project.

---

# 🚀 Deployment

The application can be deployed using a Node-compatible hosting provider.

Before deployment:

1. Build the application.

```bash
npm run build
```

2. Configure production environment variables.

3. Ensure the production database is available.

4. Set a secure `AUTH_SECRET`.

5. Configure the production `APP_URL`.

6. Configure the required AI API key(s).

7. Start the application.

```bash
npm start
```

---

# 🔐 Production Checklist

Before deploying to production:

* [ ] Replace development `AUTH_SECRET`
* [ ] Configure production database
* [ ] Configure AI API keys
* [ ] Never expose API keys in frontend code
* [ ] Verify CORS/security configuration
* [ ] Verify authentication
* [ ] Verify role permissions
* [ ] Test tenant isolation
* [ ] Test CSV validation
* [ ] Test AI fallback behavior
* [ ] Test error handling
* [ ] Test production build
* [ ] Test all major routes
* [ ] Remove development-only credentials
* [ ] Review environment variables

---

# 🧪 Recommended QA Scenarios

Before submitting the project, test the following scenarios.

### Authentication

* Register a new account
* Log in
* Log out
* Refresh the page
* Access protected pages while logged out

### RBAC

Test all three roles:

```text
ADMIN
ANALYST
VIEWER
```

Verify that unauthorized operations return a proper `403` response.

### Feedback

* Create feedback
* Edit feedback
* Search feedback
* Filter feedback
* Change status
* Import CSV
* Import simulated channel data

### AI

* Classify feedback
* Re-classify feedback
* Ask LOOP a question
* Ask a question with insufficient evidence
* Generate a report

### Analytics

* Change date range
* Filter sentiment
* Filter themes
* Verify charts update
* Verify empty states

### Security

Create two separate workspaces and verify that:

> Workspace A cannot access Workspace B's feedback.

This should be tested directly against API endpoints rather than only through the UI.

---

# 🎓 Internship Project Context

LOOP was developed as a corporate-grade web-development internship project focused on full-stack engineering and applied AI.

The project demonstrates:

* Full-stack web development
* REST API development
* Database design
* Authentication
* RBAC
* Multi-tenancy
* Data ingestion
* Data visualization
* AI integration
* Retrieval-grounded generation
* Analytics
* Responsive UI development
* Production deployment practices

The project is designed around the principle:

> **Turn scattered customer feedback into a ranked, evidence-backed list of what to do next.**

---

# 🔮 Future Improvements

Potential future enhancements include:

* Real Zendesk integration
* Real App Store integrations
* Slack integration
* Advanced vector databases
* Saved inbox views
* Suggested product-action queues
* Sentiment alerts
* Scheduled reports
* Advanced customer segmentation
* Product roadmap integration
* More advanced semantic clustering
* Automated feedback deduplication
* Feedback prioritization scoring

These features are intentionally kept separate from the current core implementation.

---

# 📌 Project Status

**Status:** Internship Project / Active Development

**Project:** LOOP — AI Customer-Feedback Intelligence Platform

**Version:** 1.0.0

**Application Type:** AI-powered SaaS / Full-Stack Web Application

---

# 👤 Author

**Palak Gupta**

B.Tech — Computer Science & Engineering

### Project

**LOOP — AI Customer-Feedback Intelligence Platform**

---

# 📄 License

This project was developed as part of an internship project.

Add an appropriate license here if the repository is intended to be publicly distributed.

---

## ⭐ Final Note

LOOP is built around a simple idea:

> **Customer feedback is valuable only when teams can turn it into decisions.**

LOOP closes that gap by combining feedback ingestion, analytics, AI classification, theme intelligence, retrieval-grounded Q&A and Voice-of-Customer reporting in one platform.

**Close the loop. Understand your customers. Build what matters.**

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
   
