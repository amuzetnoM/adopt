# AdOpt: AI-Driven Advertising Platform & 
> LEGION PROTOCOL: Autonomous Operators

**AdOpt** is an enterprise-grade, single-page application (SPA) built with Angular v18+ (Zoneless) that leverages Google's Gemini 2.5 Flash and Imagen 4.0 models to automate the entire advertising campaign lifecycle. 

From brand analysis to visual asset generation and SEO reporting, AdOpt acts as a creative agency in a box.

---

## 📑 Table of Contents

1. [System Architecture](#system-architecture)
2. [Getting Started](#getting-started)
3. [The Ad Operator (Autonomous Agent)](#the-ad-operator-autonomous-agent)
4. [Feature Deep Dive](#feature-deep-dive)
    *   [Brand Extraction & Setup](#1-brand-extraction--setup)
    *   [Phase 1: Creative Ideation](#2-phase-1-creative-ideation)
    *   [Phase 2: Production (A/B Testing & SEO)](#3-phase-2-production-ab-testing--seo)
    *   [Visual Generation (Imagen 4.0)](#4-visual-generation-imagen-40)
    *   [Campaign Reporting](#5-campaign-reporting)
    *   [Integration Hub](#6-integration-hub)
5. [Data Models](#data-models)
6. [Troubleshooting & Guidelines](#troubleshooting--guidelines)

---

## 🏗 System Architecture

AdOpt is built on a **Zoneless Angular** architecture for maximum performance and reactivity using Signals.

*   **Frontend**: Angular (Standalone Components, Signals).
*   **Styling**: Tailwind CSS (Utility-first).
*   **AI Engine**: Google GenAI SDK (`@google/genai`).
    *   **Text/Logic**: `gemini-2.5-flash`
    *   **Images**: `imagen-4.0-generate-001`
*   **State Management**: `StorageService` (Local Storage + Signals). The UI is purely a reflection of this persistent state.
*   **Routing**: Hash-based routing (Applet compatible).

---

## 🚀 Getting Started

### Prerequisites
*   Node.js & npm
*   A valid **Google Gemini API Key**.

### Configuration
The application requires the API key to be injected via the environment variable `process.env.API_KEY`. 

### Running the App
The application bootstraps via `index.tsx` (Applet standard) or `main.ts` (Standard Angular). Ensure `zone.js` is **not** imported.

---

## 🤖 The Ad Operator (Autonomous Agent)

The **Ad Operator** is a conversational AI agent capable of controlling the entire application. It does not just "chat"; it executes actual code functions to manipulate the app's state.

### Capabilities
The Operator interacts with the `StorageService` and `GeminiService` via the following defined tools:

1.  **Navigation**: Can move the user between Dashboard, Create, Project, and Integration views.
2.  **Project Management**: Can create new projects, open existing ones, and read project details.
3.  **Brand Analysis**: Can trigger URL scraping or file analysis to extract brand DNA.
4.  **Ideation**: Can generate creative concepts (Phase 1).
5.  **Selection**: Can select/approve specific concepts based on user feedback.
6.  **Production**: Can generate Final Ads (Copy + SEO + Prompt) for selected concepts.
7.  **Visuals**: Can trigger Imagen 4.0 to render images for all ads.
8.  **Scheduling**: Can set launch timestamps.
9.  **Reporting**: Can generate and save the HTML SEO report.

### Example Workflow (End-to-End)
You can type the following prompt to the Operator to handle a full campaign automatically:

> *"Create a campaign for 'NeuroFizz', a brain-boosting soda. Analyze their vibe, generate 5 concepts, pick the most futuristic one, render the final ads with images, and schedule it for next Friday."*

**The Operator will:**
1.  Call `create_project`.
2.  Call `generate_concepts`.
3.  Analyze the returned concepts to find the "futuristic" one.
4.  Call `select_concept` on that specific ID.
5.  Call `generate_finals` (Creating A/B variants).
6.  Call `trigger_all_images` (Render visuals).
7.  Call `schedule_campaign`.

---

## 🔍 Feature Deep Dive

### 1. Brand Extraction & Setup
*   **Component**: `SetupFormComponent`
*   **Functionality**: Users define Brand Name, Industry, Product Description, Audience, Colors, and Style.
*   **AI Power**: 
    *   **URL Analysis**: Uses Google Search Grounding to scrape a website and extract brand parameters into JSON.
    *   **File Analysis**: Users can upload a logo or brand guide (Image/PDF). The AI analyzes the visual assets to extract hex codes and design style.

### 2. Phase 1: Creative Ideation
*   **Component**: `IdeationCardComponent`
*   **Logic**: The AI generates a set of high-level marketing angles (e.g., "The emotional hook," "The logical benefit").
*   **Data**: Each concept contains a Headline, Hook, Mood, Typography suggestion, and Color Palette.
*   **User Action**: Users (or the Agent) must "Select" winning concepts to proceed to production.

### 3. Phase 2: Production (A/B Testing & SEO)
*   **Component**: `AdCardComponent`
*   **A/B Testing Engine**: For *every* selected concept, the system generates two distinct variants:
    *   **Variant A**: Performance-focused (Short, punchy, hard CTA).
    *   **Variant B**: Brand/Story-focused (Narrative, soft CTA).
*   **Auto-SEO**: The AI analyzes the generated copy and attaches:
    *   **Keywords**: High-density keywords found in the text.
    *   **Hashtags**: Contextually relevant tags.
    *   **Meta Description**: strictly 140-160 characters for optimal SERP display.
    *   **Score**: A 0-100 heuristic score on SEO health.

### 4. Visual Generation (Imagen 4.0)
*   **Model**: `imagen-4.0-generate-001`
*   **Prompt Engineering**: The system automatically constructs a complex prompt including:
    *   The visual direction from the concept.
    *   The Brand Colors (forced inclusion).
    *   Composition rules (3:4 Vertical, Professional Lighting).
*   **Output**: Returns a Base64 encoded image displayed directly in the Ad Card.

### 5. Campaign Reporting
*   **Feature**: SEO Report
*   **Logic**: The AI reads the entire state of the project (Ideation + Final Ads) and writes a comprehensive HTML report analyzing the keyword strategy, consistency, and platform suitability.

### 6. Integration Hub
*   **Component**: `IntegrationWizardComponent`
*   **Function**: A mock wizard that simulates the OAuth/API key exchange flow for platforms like Facebook, Instagram, LinkedIn, and TikTok.
*   **State**: Tracks "Connected" status in LocalStorage to simulate a live environment.

---

## 💾 Data Models

### Project Structure
```typescript
interface Project {
  id: string;
  status: 'draft' | 'ideation' | 'production' | 'completed';
  params: ProjectParams; // Brand details
  ideationConcepts: IdeationConcept[];
  finalAds: FinalAd[]; // Contains Copy, Image, SEO data
  seoReport?: string;
}
```

### Final Ad Structure
```typescript
interface FinalAd {
  platform: 'facebook' | 'instagram' | ...;
  variantName: 'Variation A' | 'Variation B'; // A/B Testing
  headline: string;
  body: string;
  visualPrompt: string;
  imageUrl?: string; // Base64
  seo: {
    keywords: string[];
    score: number;
    metaDescription: string;
    // ...
  };
}
```

---

## 🔧 Troubleshooting & Guidelines

### 1. Chat/Operator Errors
*   **"I lost connection..."**: This usually happens if the model returns a `ContentUnion` error (mixing text and function calls incorrectly). The updated `AiAssistantComponent` handles this by ensuring strict types, but if it persists, clear the chat or refresh.
*   **Looping**: If the agent keeps calling the same tool, it might be stuck. Type "Stop" or refresh the page.

### 2. Image Generation Fails
*   **Cause**: Usually due to Safety Filters or Quota limits on the `imagen-4.0` model.
*   **Fix**: The UI will revert to the "Generate Visual" button. Wait a moment and click it manually to retry.

### 3. SEO Data Missing
*   **Cause**: Rarely, the JSON parser might fail if the model output is malformed.
*   **Fix**: Regenerate the finals. The prompt instruction `Return strictly JSON` is robust but not 100% infallible with LLMs.

### 4. Performance
*   Since data is stored in `localStorage`, very large campaigns (50+ images) might slow down the initial load or hit storage quotas (5MB limit typical). Clean up old projects periodically via the Dashboard.

---

**AdOpt v2.0** - *Autonomous Advertising Operations Platform*
