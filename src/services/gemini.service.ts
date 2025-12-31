import { Injectable, inject } from '@angular/core';
import { GoogleGenAI, Type, Chat, Tool, FunctionDeclaration, Part } from "@google/genai";
import { IdeationConcept, FinalAd, ProjectParams, StorageService, Project } from './storage.service';

export interface BrandProfile {
  brandName?: string;
  industry?: string;
  productDesc?: string;
  targetAudience?: string;
  brandColors?: string;
  brandStyle?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private storage = inject(StorageService);

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY || '' });
  }

  // --- HELPER: ROBUST JSON PARSING ---
  private cleanJson(text: string): string {
    if (!text) return '[]';
    // Remove markdown code blocks (```json ... ```)
    return text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
  }

  // --- BRAND EXTRACTION ---

  async analyzeBrandAsset(fileBase64: string, mimeType: string): Promise<BrandProfile> {
    try {
      const prompt = `
        Analyze this brand asset. Extract:
        1. Brand Name
        2. Industry
        3. Product/Service Description
        4. Target Audience
        5. Primary Brand Colors (hex)
        6. Brand Visual Style

        Return strictly JSON.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: mimeType, data: fileBase64 } }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brandName: { type: Type.STRING },
              industry: { type: Type.STRING },
              productDesc: { type: Type.STRING },
              targetAudience: { type: Type.STRING },
              brandColors: { type: Type.STRING },
              brandStyle: { type: Type.STRING }
            }
          }
        }
      });

      return JSON.parse(this.cleanJson(response.text || '{}'));
    } catch (e) {
      console.error('Brand Asset Analysis Failed', e);
      return {};
    }
  }

  async analyzeWebsite(url: string): Promise<BrandProfile> {
    try {
      const prompt = `
        Analyze brand at: ${url}
        Perform a deep search for: Brand Name, Industry, Product Description, Audience, Colors, Style.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const searchResultText = response.text || '';

      const formatterResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Extract the brand details from this text into JSON: ${searchResultText}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brandName: { type: Type.STRING },
              industry: { type: Type.STRING },
              productDesc: { type: Type.STRING },
              targetAudience: { type: Type.STRING },
              brandColors: { type: Type.STRING },
              brandStyle: { type: Type.STRING }
            }
          }
        }
      });

      return JSON.parse(this.cleanJson(formatterResponse.text || '{}'));
    } catch (e) {
      console.error('Website Analysis Failed', e);
      return {};
    }
  }

  // --- CREATIVE GENERATION ---

  async generateIdeationConcepts(
    params: ProjectParams,
    count: number
  ): Promise<IdeationConcept[]> {
    const prompt = `
      Generate ${count} advertising concepts for:
      Brand: ${params.brandName}, Industry: ${params.industry}, Product: ${params.productDesc}, Audience: ${params.targetAudience}, Style: ${params.brandStyle}.
      Return JSON array.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              angle: { type: Type.STRING },
              headline: { type: Type.STRING },
              hook: { type: Type.STRING },
              mood: { type: Type.STRING },
              typography: { type: Type.STRING },
              colorPaletteSuggestion: { type: Type.STRING },
              visualDirection: { type: Type.STRING }
            },
            required: ['angle', 'headline', 'hook', 'mood', 'typography', 'visualDirection']
          }
        }
      }
    });

    const rawData = JSON.parse(this.cleanJson(response.text || '[]'));
    return rawData.map((item: any) => ({
      ...item,
      id: crypto.randomUUID(),
      isSelected: false
    }));
  }

  async generateFinalAds(
    params: ProjectParams,
    selectedConcepts: IdeationConcept[]
  ): Promise<FinalAd[]> {
    const conceptsContext = selectedConcepts.map((c, i) =>
      `Concept ${i + 1}: Angle="${c.angle}", Visual="${c.visualDirection}", Mood="${c.mood}"`
    ).join('\n');

    const prompt = `
      Create high-performance final ads for: ${params.brandName}.
      Brand Colors: ${params.brandColors || 'Brand standard colors'}
      
      Approved Concepts: 
      ${conceptsContext}

      GENERATE 2 VARIATIONS PER CONCEPT (A/B TESTING):
      For every selected concept, you MUST generate TWO distinct ad variations.
      1. Variation A (Performance): Short, punchy, direct-response focused. Clear hard-hitting CTA.
      2. Variation B (Story/Brand): More emotional, narrative-driven, or value-focused. Soft but persuasive CTA.

      COPYWRITING RULES:
      - Headlines must be attention-grabbing and under 50 characters if possible.
      - Body copy must be concise, punchy, and benefit-driven. Avoid fluff.
      - CTAs must be action-oriented (e.g., "Shop Now", "Get Started", "Learn More").

      AUTO-SEO & METADATA REQUIREMENTS (STRICT):
      1. Keywords: Extract 5-8 high-value keywords. Ensure high density in the rationale but natural flow in copy.
      2. Hashtags: Generate 5-10 mixed hashtags (broad + niche). RELEVANCE IS KEY.
      3. Meta Description: STRICTLY between 140-160 characters. Optimized for high Click-Through Rate (CTR) in search results.
      4. Score: Calculate a realistic SEO score (0-100) based on keyword usage and readability.

      VISUAL PROMPT INSTRUCTIONS:
      - Explicitly incorporate brand colors: ${params.brandColors}.
      - Describe a 3:4 Vertical composition.
      - Specify lighting (e.g., "soft studio lighting", "golden hour") and texture.

      Generate a flat JSON array containing both variations for all concepts.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING, enum: ['facebook', 'instagram', 'linkedin', 'twitter', 'generic'] },
              variantName: { type: Type.STRING, description: "e.g. 'Variation A' or 'Variation B'" },
              headline: { type: Type.STRING },
              body: { type: Type.STRING },
              callToAction: { type: Type.STRING },
              visualPrompt: { type: Type.STRING },
              seo: {
                type: Type.OBJECT,
                properties: {
                  keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  metaDescription: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  rationale: { type: Type.STRING }
                },
                required: ['keywords', 'hashtags', 'metaDescription', 'score', 'rationale']
              }
            },
            required: ['platform', 'headline', 'body', 'callToAction', 'visualPrompt', 'seo', 'variantName']
          }
        }
      }
    });

    const rawData = JSON.parse(this.cleanJson(response.text || '[]'));
    return rawData.map((item: any) => ({
      ...item,
      id: crypto.randomUUID(),
      isLoadingImage: false
    }));
  }

  async generateAdImage(visualPrompt: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: visualPrompt + ", professional advertising photography, 8k, award winning, commercial lighting, vertical composition",
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '3:4',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64 = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64}`;
      }
      return null;
    } catch (error) {
      console.error('Image generation failed', error);
      return null;
    }
  }

  // --- SEO REPORTING ---

  async generateProjectSeoReport(project: Project): Promise<string> {
    const adsContext = project.finalAds.map((ad, i) => `
      Ad ${i + 1} (${ad.platform} - ${ad.variantName}):
      Headline: ${ad.headline}
      Keywords: ${ad.seo?.keywords?.join(', ')}
      Score: ${ad.seo?.score}
    `).join('\n');

    const prompt = `
      Generate a comprehensive Campaign SEO Report for: ${project.name} (${project.params.industry}).
      
      Ads Data:
      ${adsContext}
      
      The report should include:
      1. Overall Campaign SEO Health Check.
      2. Keyword Strategy Analysis (Are we targeting the right terms?).
      3. Cross-Platform Optimization suggestions.
      4. A "Final Verdict" summary.
      
      Format the output as clean, structured HTML (no markdown code blocks, just raw HTML tags like <h3>, <p>, <ul>). 
      Make it look professional.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || '<p>Unable to generate report.</p>';
  }

  // --- AUTONOMOUS AGENT TOOLS ---

  private getToolsConfig(): Tool[] {
    return [{
      functionDeclarations: [
        // Navigation & Basic
        {
          name: 'navigate',
          description: 'Navigate to a different part of the application.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              view: { type: Type.STRING, enum: ['dashboard', 'create', 'project', 'integrations'], description: 'The view ID to navigate to.' }
            },
            required: ['view']
          }
        },
        {
          name: 'open_project',
          description: 'Open a specific project by ID.',
          parameters: {
            type: Type.OBJECT,
            properties: { id: { type: Type.STRING } },
            required: ['id']
          }
        },
        {
          name: 'create_project',
          description: 'Create a new advertising campaign project.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              brandName: { type: Type.STRING },
              industry: { type: Type.STRING },
              productDesc: { type: Type.STRING },
              targetAudience: { type: Type.STRING },
              brandColors: { type: Type.STRING },
              brandStyle: { type: Type.STRING }
            },
            required: ['brandName', 'industry', 'productDesc', 'targetAudience']
          }
        },
        {
          name: 'analyze_brand_url',
          description: 'Analyze a website URL to extract brand details.',
          parameters: {
            type: Type.OBJECT,
            properties: { url: { type: Type.STRING } },
            required: ['url']
          }
        },

        // Campaign Execution Tools
        {
          name: 'generate_concepts',
          description: 'Generate ideation concepts for a project (Phase 1).',
          parameters: {
            type: Type.OBJECT,
            properties: {
              projectId: { type: Type.STRING },
              count: { type: Type.INTEGER, description: 'Number of concepts (3-10)' }
            },
            required: ['projectId']
          }
        },
        {
          name: 'select_concept',
          description: 'Mark a concept as selected/approved.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              projectId: { type: Type.STRING },
              conceptIndex: { type: Type.INTEGER, description: '0-based index of the concept to select' }
            },
            required: ['projectId', 'conceptIndex']
          }
        },
        {
          name: 'generate_finals',
          description: 'Generate final ad copy and prompts from selected concepts (Phase 2). Automatically includes SEO optimization.',
          parameters: {
            type: Type.OBJECT,
            properties: { projectId: { type: Type.STRING } },
            required: ['projectId']
          }
        },
        {
          name: 'trigger_all_images',
          description: 'Start image generation for all ads in the project that lack visuals.',
          parameters: {
            type: Type.OBJECT,
            properties: { projectId: { type: Type.STRING } },
            required: ['projectId']
          }
        },
        {
          name: 'schedule_campaign',
          description: 'Set a schedule time for all ads in the project.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              projectId: { type: Type.STRING },
              timestamp: { type: Type.NUMBER, description: 'Unix timestamp' }
            },
            required: ['projectId', 'timestamp']
          }
        },
        {
          name: 'generate_seo_report',
          description: 'Generate a comprehensive SEO report for the campaign.',
          parameters: {
            type: Type.OBJECT,
            properties: { projectId: { type: Type.STRING } },
            required: ['projectId']
          }
        },
        {
          name: 'get_project_details',
          description: 'Read the full state of a project.',
          parameters: {
            type: Type.OBJECT,
            properties: { projectId: { type: Type.STRING } },
            required: ['projectId']
          }
        },
        {
          name: 'list_all_projects',
          description: 'Get a list of all projects with their basic info.',
          parameters: {
            type: Type.OBJECT,
            properties: {},
            required: []
          }
        },
        {
          name: 'delete_project',
          description: 'Delete a project by ID. Use with caution.',
          parameters: {
            type: Type.OBJECT,
            properties: { projectId: { type: Type.STRING } },
            required: ['projectId']
          }
        },
        {
          name: 'export_project_data',
          description: 'Export project data to downloadable file.',
          parameters: {
            type: Type.OBJECT,
            properties: { projectId: { type: Type.STRING } },
            required: ['projectId']
          }
        }
      ]
    }];
  }

  async executeTool(name: string, args: any): Promise<any> {
    console.log(`[Tool Exec] ${name}`, args);
    const safeArgs = args || {};

    try {
      switch (name) {
        // --- Navigation ---
        case 'navigate':
          if (!safeArgs.view) return { error: true, message: 'Missing view' };
          this.storage.setView(safeArgs.view);
          return { success: true, message: `Navigated to ${safeArgs.view}` };

        case 'open_project':
          if (!safeArgs.id) return { error: true, message: 'Missing project ID' };
          this.storage.openProject(safeArgs.id);
          return { success: true, message: `Opened project ${safeArgs.id}` };

        // --- Creation ---
        case 'create_project':
          if (!safeArgs.brandName) return { error: true, message: 'Missing brand name' };
          const proj = this.storage.createProject(safeArgs.brandName + ' Campaign', {
            brandName: safeArgs.brandName,
            industry: safeArgs.industry || 'General',
            productDesc: safeArgs.productDesc || 'A revolutionary product.',
            targetAudience: safeArgs.targetAudience || 'General Public',
            brandColors: safeArgs.brandColors || '#000000',
            brandStyle: safeArgs.brandStyle || 'Modern'
          });
          this.storage.openProject(proj.id);
          return { success: true, projectId: proj.id, message: `Created project "${proj.name}" and opened it.` };

        case 'analyze_brand_url':
          if (!safeArgs.url) return { error: true, message: 'Missing URL' };
          const profile = await this.analyzeWebsite(safeArgs.url);
          return { success: true, data: profile };

        // --- Phase 1: Ideation ---
        case 'generate_concepts': {
          if (!safeArgs.projectId) return { error: true, message: 'Missing project ID' };
          const p = this.storage.getProject(safeArgs.projectId);
          if (!p) return { error: 'Project not found' };

          // Use default if count is missing or 0
          const count = Number(safeArgs.count) || 3;

          const concepts = await this.generateIdeationConcepts(p.params, count);
          this.storage.updateProject(safeArgs.projectId, {
            ideationConcepts: concepts,
            stage: 'ideation',
            status: 'ideation'
          });
          return { success: true, count: concepts.length, message: 'Concepts generated.' };
        }

        case 'select_concept': {
          if (!safeArgs.projectId) return { error: true, message: 'Missing project ID' };
          const p = this.storage.getProject(safeArgs.projectId);
          if (!p) return { error: 'Project not found' };
          const idx = Number(safeArgs.conceptIndex);
          const c = p.ideationConcepts[idx];
          if (!c) return { error: 'Concept index out of bounds' };

          // Toggle selection true
          const updated = p.ideationConcepts.map((item, i) =>
            i === idx ? { ...item, isSelected: true } : item
          );
          this.storage.updateProject(safeArgs.projectId, { ideationConcepts: updated });
          return { success: true, message: `Selected concept: ${c.headline}` };
        }

        // --- Phase 2: Production ---
        case 'generate_finals': {
          if (!safeArgs.projectId) return { error: true, message: 'Missing project ID' };
          const p = this.storage.getProject(safeArgs.projectId);
          if (!p) return { error: 'Project not found' };

          const selected = p.ideationConcepts.filter(c => c.isSelected);
          if (selected.length === 0) return { error: 'No concepts selected. Use select_concept first.' };

          const finalAds = await this.generateFinalAds(p.params, selected);
          this.storage.updateProject(safeArgs.projectId, {
            finalAds,
            stage: 'final',
            status: 'production'
          });
          return { success: true, count: finalAds.length, message: 'Ad copy generated with SEO metadata. Visuals pending.' };
        }

        // --- Visuals ---
        case 'trigger_all_images': {
          if (!safeArgs.projectId) return { error: true, message: 'Missing project ID' };
          const p = this.storage.getProject(safeArgs.projectId);
          if (!p) return { error: 'Project not found' };

          const adsToGen = p.finalAds.filter(a => !a.imageUrl);

          // Trigger async (not awaiting full completion to keep chat responsive)
          adsToGen.forEach(async (ad) => {
            this.storage.updateProject(safeArgs.projectId, {
              finalAds: this.storage.getProject(safeArgs.projectId)!.finalAds.map(x => x.id === ad.id ? { ...x, isLoadingImage: true } : x)
            });
            try {
              const url = await this.generateAdImage(ad.visualPrompt);
              this.storage.updateProject(safeArgs.projectId, {
                finalAds: this.storage.getProject(safeArgs.projectId)!.finalAds.map(x => x.id === ad.id ? { ...x, isLoadingImage: false, imageUrl: url || undefined } : x)
              });
            } catch {
              this.storage.updateProject(safeArgs.projectId, {
                finalAds: this.storage.getProject(safeArgs.projectId)!.finalAds.map(x => x.id === ad.id ? { ...x, isLoadingImage: false } : x)
              });
            }
          });

          return { success: true, message: `Triggered image generation for ${adsToGen.length} ads.` };
        }

        case 'schedule_campaign': {
          if (!safeArgs.projectId) return { error: true, message: 'Missing project ID' };
          const p = this.storage.getProject(safeArgs.projectId);
          if (!p) return { error: 'Project not found' };
          const updatedAds = p.finalAds.map(a => ({ ...a, scheduledTime: safeArgs.timestamp || Date.now() + 86400000 }));
          this.storage.updateProject(safeArgs.projectId, { finalAds: updatedAds, status: 'completed' });
          return { success: true, message: 'Campaign scheduled.' };
        }

        case 'generate_seo_report': {
          if (!safeArgs.projectId) return { error: true, message: 'Missing project ID' };
          const p = this.storage.getProject(safeArgs.projectId);
          if (!p) return { error: 'Project not found' };

          const report = await this.generateProjectSeoReport(p);
          this.storage.updateProject(safeArgs.projectId, { seoReport: report });
          return { success: true, message: 'SEO Report generated successfully.' };
        }

        case 'get_project_details': {
          if (!safeArgs.projectId) return { error: true, message: 'Missing project ID' };
          const p = this.storage.getProject(safeArgs.projectId);
          if (!p) return { error: 'Project not found' };
          return { success: true, data: p };
        }

        case 'list_all_projects': {
          const projects = this.storage.projects().map(p => ({
            id: p.id,
            name: p.name,
            status: p.status,
            brandName: p.params.brandName,
            industry: p.params.industry,
            createdAt: p.createdAt,
            lastModified: p.lastModified,
            conceptCount: p.ideationConcepts.length,
            adCount: p.finalAds.length
          }));
          return { success: true, count: projects.length, projects };
        }

        case 'delete_project': {
          if (!safeArgs.projectId) return { error: true, message: 'Missing project ID' };
          const p = this.storage.getProject(safeArgs.projectId);
          if (!p) return { error: 'Project not found' };
          this.storage.deleteProject(safeArgs.projectId);
          return { success: true, message: `Deleted project: ${p.name}` };
        }

        case 'export_project_data': {
          if (!safeArgs.projectId) return { error: true, message: 'Missing project ID' };
          const p = this.storage.getProject(safeArgs.projectId);
          if (!p) return { error: 'Project not found' };

          // Trigger export (simplified - actual implementation would use DataBackupService)
          const jsonString = JSON.stringify(p, null, 2);
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${p.name.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          return { success: true, message: `Exported project: ${p.name}` };
        }

        default:
          return { error: true, message: `Tool ${name} not implemented.` };
      }
    } catch (e) {
      console.error('Tool execution error', e);
      return { error: true, message: 'Tool execution failed.' };
    }
  }

  // --- CHAT SESSION ---

  initChat(context: string): Chat {
    return this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `
          You are the AdOpt Autonomous Operator - an advanced AI system controller.
          You have complete control over the advertising platform through function calling.
          
          CURRENT CONTEXT:
          ${context}

          YOUR CAPABILITIES:
          - Create and manage advertising campaigns end-to-end
          - Navigate between different views and sections
          - Analyze brands from URLs or uploaded assets
          - Generate creative concepts and marketing angles
          - Produce final ad copy with A/B testing variants
          - Generate professional images using Imagen 4.0
          - Create comprehensive SEO reports
          - Schedule campaigns and set launch times
          - List, search, export, and delete projects
          
          OPERATIONAL RULES:
          1. **Always use tools** - Never pretend to do actions without calling the appropriate function
          2. **Be proactive** - Suggest next steps and anticipate user needs
          3. **Ask for clarity** - If brand details or parameters are missing, ask before proceeding
          4. **Chain operations** - For "do it all" requests, execute the full workflow:
             Create → Ideate → Select Best → Generate Finals → Create Images → Schedule → Report
          5. **Be concise** - Keep responses short and actionable
          6. **Show expertise** - When selecting concepts, explain your reasoning based on marketing strategy
          7. **Handle errors gracefully** - If a tool fails, explain why and suggest alternatives
          8. **Provide context** - When listing projects, mention status and next recommended actions
          
          RESPONSE STYLE:
          - Professional but friendly
          - Use marketing terminology appropriately
          - Provide brief explanations of what you're doing
          - Confirm successful actions with specific details
          - For multi-step operations, explain the workflow briefly
          
          EXAMPLES OF GREAT INTERACTIONS:
          User: "Create a campaign for TechFlow, a SaaS project management tool"
          You: "Creating campaign for TechFlow... I'll need a few more details:
          - Target audience? (e.g., 'Small business owners', 'Enterprise teams')
          - Industry focus?
          - Any specific brand colors or style preferences?
          Once you provide these, I'll generate creative concepts immediately."
          
          User: "List all my campaigns"
          You: [calls list_all_projects] "You have 5 campaigns:
          1. TechFlow (Production) - 3 ads ready, needs scheduling
          2. NeuroFizz (Ideation) - 5 concepts generated, waiting for selection
          3. StyleHub (Draft) - Just created, ready for ideation
          4. GreenLeaf (Completed) - Live campaign
          5. FitPro (Ideation) - 8 concepts, 2 selected
          
          What would you like to work on?"
        `,
        tools: this.getToolsConfig()
      }
    });
  }
}
