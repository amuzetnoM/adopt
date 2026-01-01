# ADOPT Studio: AI-Driven Advertising Platform
> Legion: Ad Operators

**ADOPT Studio** is an enterprise-grade, single-page application (SPA) built with Angular v18+ (Zoneless) that leverages Google's Gemini 2.5 Flash and Imagen 4.0 models to automate the entire advertising campaign lifecycle. 

From brand analysis to visual asset generation and SEO reporting, ADOPT Studio acts as a creative agency in a box.

---

## 📸 Screenshots

### Dashboard View
<div style="display: flex; gap: 10px;">
  <div>
    <p><strong>Light Mode</strong></p>
    <img src="https://github.com/user-attachments/assets/4a2c30d3-7a72-4bba-a89c-f7e6a326aab1" alt="Dashboard Light Mode" width="400"/>
  </div>
  <div>
    <p><strong>Dark Mode</strong></p>
    <img src="https://github.com/user-attachments/assets/c958ea06-5f68-470d-8cdd-2c37ff0a6ca4" alt="Dashboard Dark Mode" width="400"/>
  </div>
</div>

### Create Campaign
<div style="display: flex; gap: 10px;">
  <div>
    <p><strong>Light Mode</strong></p>
    <img src="https://github.com/user-attachments/assets/13816859-2c64-491e-a6b4-2c075e57b629" alt="Create Campaign Light Mode" width="400"/>
  </div>
  <div>
    <p><strong>Dark Mode</strong></p>
    <img src="https://github.com/user-attachments/assets/758c8ffa-1c47-42d9-bd4b-b9b5a1604707" alt="Create Campaign Dark Mode" width="400"/>
  </div>
</div>

### Integration Hub
<div style="display: flex; gap: 10px;">
  <div>
    <p><strong>Light Mode</strong></p>
    <img src="https://github.com/user-attachments/assets/1a5da371-d80e-4c79-8563-4d2625e8ad6b" alt="Integration Hub Light Mode" width="400"/>
  </div>
  <div>
    <p><strong>Dark Mode</strong></p>
    <img src="https://github.com/user-attachments/assets/5377f73b-508d-4cc9-a463-a33ff38f2aec" alt="Integration Hub Dark Mode" width="400"/>
  </div>
</div>

**Features:**
- ✨ **Smooth Dark Mode**: Slider-based theme control with gradual transition from light to dark
- 🎨 **Vivid Accent Colors**: Eye-catching purple/indigo accents that pop in dark mode
- 🎯 **Neomorphic Design**: Modern, depth-focused UI with subtle shadows and gradients
- 📱 **Responsive Layout**: Works seamlessly across desktop, tablet, and mobile devices

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
*   **Routing**: Hash-based routing for SPA compatibility.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js & npm (v18 or higher recommended)
*   A valid **Google Gemini API Key** - [Get one here](https://makersuite.google.com/app/apikey)

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AdOpt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your Gemini API key:
   ```
   API_KEY=your_actual_gemini_api_key_here
   ```

4. **Run the application**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   ```

That's it! The application is now fully operational and ready to create AI-powered advertising campaigns.

### Features Available Out of the Box
✅ **8 Languages**: English, Spanish, French, German, Japanese, Chinese, Portuguese, Italian  
✅ **AI Operator**: Autonomous agent that can manage complete workflows  
✅ **Smart Workflows**: Context-aware suggestions based on project state  
✅ **Data Management**: Export/import campaigns, automatic backups  
✅ **Search & Filter**: Find campaigns instantly  
✅ **Image Generation**: AI-powered visuals with Imagen 4.0  
✅ **SEO Reports**: Comprehensive campaign analysis  

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

**ADOPT Studio v2.0** - *Autonomous Advertising Operations Platform*
