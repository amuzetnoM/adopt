import { Injectable, signal, computed } from '@angular/core';

export interface ProjectParams {
  brandName: string;
  industry: string;
  productDesc: string;
  targetAudience: string;
  brandColors: string;
  brandStyle: string;
}

export interface IdeationConcept {
  id: string;
  angle: string;
  headline: string;
  hook: string;
  mood: string;
  typography: string;
  colorPaletteSuggestion: string;
  visualDirection: string; // Text description
  isSelected: boolean;
}

export interface SeoData {
  keywords: string[];
  hashtags: string[];
  metaDescription: string;
  score: number; // 0-100
  rationale: string;
}

export interface FinalAd {
  id: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'generic';
  headline: string;
  body: string;
  callToAction: string;
  imageUrl?: string;
  visualPrompt: string;
  scheduledTime?: number; // timestamp
  scheduledPlatforms?: string[];
  isLoadingImage?: boolean;
  seo?: SeoData; // New Auto-SEO Field
  variantName?: string; // A/B Testing Label (e.g., 'Variation A')
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  lastModified: number;
  // Lifecycle: draft -> ideation (generated concepts) -> production (generating finals) -> completed (finals ready)
  status: 'draft' | 'ideation' | 'production' | 'completed'; 
  stage: 'ideation' | 'final'; 
  params: ProjectParams;
  
  // Data containers
  ideationConcepts: IdeationConcept[];
  finalAds: FinalAd[];
  seoReport?: string; // Markdown/HTML report for the whole campaign
}

export type PlatformId = 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'tiktok' | 'google_ads' | 'youtube';
export type AppView = 'dashboard' | 'create' | 'project' | 'integrations';

export interface IntegrationField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url';
  placeholder: string;
  description: string;
  required: boolean;
}

export interface IntegrationGuide {
  title: string;
  steps: string[];
  docsUrl: string;
}

export interface Integration {
  id: PlatformId;
  name: string;
  icon: string; // HTML string for SVG
  color: string; // Tailwind class for text/bg
  isConnected: boolean;
  config: Record<string, string>; // Stores the actual API keys/values
  lastSync?: number;
  fields: IntegrationField[];
  guide: IntegrationGuide;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEY = 'adscale_projects_v2'; 
  private readonly INTEGRATION_KEY = 'adscale_integrations_v2';
  
  // Data State
  projects = signal<Project[]>([]);
  integrations = signal<Integration[]>([]);

  // UI State (Moved here to allow Agent Control)
  currentView = signal<AppView>('dashboard');
  selectedProjectId = signal<string | null>(null);

  // Computed for easier access
  activeProject = computed(() => 
    this.projects().find(p => p.id === this.selectedProjectId())
  );

  constructor() {
    this.loadProjects();
    this.loadIntegrations();
  }

  // --- UI Control Methods ---

  setView(view: AppView) {
    this.currentView.set(view);
    if (view !== 'project') {
      this.selectedProjectId.set(null);
    }
  }

  openProject(id: string) {
    const exists = this.projects().find(p => p.id === id);
    if (exists) {
      this.selectedProjectId.set(id);
      this.currentView.set('project');
    }
  }

  // --- Projects Logic ---

  getProject(id: string): Project | undefined {
    return this.projects().find(p => p.id === id);
  }

  private loadProjects() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.projects.set(parsed.map((p: any) => ({
           ...p,
           ideationConcepts: p.ideationConcepts || [],
           finalAds: p.finalAds || [],
           stage: p.stage || 'final'
        })));
      } catch (e) {
        console.error('Failed to parse projects', e);
        this.projects.set([]);
      }
    }
  }

  private save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.projects()));
  }

  createProject(name: string, params: ProjectParams): Project {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      lastModified: Date.now(),
      status: 'draft',
      stage: 'ideation',
      params,
      ideationConcepts: [],
      finalAds: []
    };

    this.projects.update(list => [newProject, ...list]);
    this.save();
    return newProject;
  }

  deleteProject(id: string) {
    this.projects.update(list => list.filter(p => p.id !== id));
    this.save();
    
    // If we deleted the currently open project, go back to dashboard
    if (this.selectedProjectId() === id) {
      this.selectedProjectId.set(null);
      this.setView('dashboard');
    }
  }

  updateProject(id: string, updates: Partial<Project>) {
    this.projects.update(list => 
      list.map(p => p.id === id ? { ...p, ...updates, lastModified: Date.now() } : p)
    );
    this.save();
  }

  updateProjectConcepts(id: string, concepts: IdeationConcept[]) {
     this.updateProject(id, { ideationConcepts: concepts });
  }

  // --- Integrations Logic ---

  private loadIntegrations() {
    const data = localStorage.getItem(this.INTEGRATION_KEY);
    const defaultList = this.getDefaultIntegrations();
    
    if (data) {
      try {
        const savedList = JSON.parse(data) as Integration[];
        const merged = defaultList.map(def => {
          const saved = savedList.find(s => s.id === def.id);
          if (saved) {
             return { ...def, isConnected: saved.isConnected, config: saved.config, lastSync: saved.lastSync };
          }
          return def;
        });
        this.integrations.set(merged);
      } catch (e) {
        this.integrations.set(defaultList);
      }
    } else {
      this.integrations.set(defaultList);
    }
  }

  saveIntegrations() {
    localStorage.setItem(this.INTEGRATION_KEY, JSON.stringify(this.integrations()));
  }

  updateIntegration(id: PlatformId, updates: Partial<Integration>) {
    this.integrations.update(list => 
      list.map(i => i.id === id ? { ...i, ...updates } : i)
    );
    this.saveIntegrations();
  }

  private getDefaultIntegrations(): Integration[] {
    return [
      { 
        id: 'facebook', 
        name: 'Facebook Ads', 
        icon: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>', 
        color: 'text-blue-600',
        isConnected: false, 
        config: {},
        fields: [
          { key: 'adAccountId', label: 'Ad Account ID', type: 'text', placeholder: 'act_123456789', description: 'Your Business Manager Ad Account ID.', required: true },
          { key: 'accessToken', label: 'System User Access Token', type: 'password', placeholder: 'EAA...', description: 'A permanent token with "ads_management" permission.', required: true },
          { key: 'pixelId', label: 'Pixel ID (Optional)', type: 'text', placeholder: '12345...', description: 'For tracking conversion events.', required: false }
        ],
        guide: {
          title: 'Meta Graph API Setup',
          docsUrl: 'https://developers.facebook.com/docs/marketing-api/get-started',
          steps: [
            'Go to business.facebook.com/settings and select your Business Portfolio.',
            'Navigate to Users > System Users. Click "Add" to create a new admin system user.',
            'Click "Generate New Token", select your App, and check permissions: "ads_management", "ads_read".',
            'Copy the Access Token string and paste it here.',
            'Find your Ad Account ID in Ad Account settings (format starts with act_).'
          ]
        }
      },
      { 
        id: 'instagram', 
        name: 'Instagram Business', 
        icon: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>', 
        color: 'text-pink-600',
        isConnected: false, 
        config: {},
        fields: [
           { key: 'igUserId', label: 'Instagram User ID', type: 'text', placeholder: '17841...', description: 'The ID of the IG Business account connected to your Page.', required: true },
           { key: 'facebookPageId', label: 'Linked Facebook Page ID', type: 'text', placeholder: '1000...', description: 'The Facebook Page backing this IG account.', required: true }
        ],
        guide: {
          title: 'Instagram Graph API',
          docsUrl: 'https://developers.facebook.com/docs/instagram-api/getting-started',
          steps: [
            'Ensure your Instagram account is a Professional Account and linked to a Facebook Page.',
            'Use the "Facebook Ads" token (from the previous setup) as it covers Instagram permissions too if configured.',
            'To find your IG User ID, use the Graph API Explorer with call: "me/accounts?fields=instagram_business_account".',
            'Enter the ID returned in the "instagram_business_account" field.'
          ]
        }
      },
      { 
        id: 'linkedin', 
        name: 'LinkedIn Ads', 
        icon: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>', 
        color: 'text-blue-700',
        isConnected: false, 
        config: {},
        fields: [
          { key: 'clientId', label: 'Client ID', type: 'text', placeholder: '86...', description: 'From LinkedIn Developer Portal.', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: '...', description: 'App secret key.', required: true },
          { key: 'adAccountId', label: 'Ad Account URN', type: 'text', placeholder: 'urn:li:sponsoredAccount:123', description: 'Your advertising account identifier.', required: true }
        ],
        guide: {
          title: 'LinkedIn Marketing API',
          docsUrl: 'https://www.linkedin.com/developers/apps',
          steps: [
            'Create an app in the LinkedIn Developer Portal.',
            'Request verification for the "Marketing Developer Platform" product.',
            'Once approved, go to the "Auth" tab to find your Client ID and Client Secret.',
            'The Ad Account URN can be found in the URL of your Campaign Manager (account=123...). Format as "urn:li:sponsoredAccount:123".'
          ]
        }
      },
      { 
        id: 'google_ads', 
        name: 'Google Ads', 
        icon: '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>', 
        color: 'text-blue-500',
        isConnected: false, 
        config: {},
        fields: [
          { key: 'customerId', label: 'Customer ID', type: 'text', placeholder: '123-456-7890', description: 'Your Google Ads account number (no dashes required, but allowed).', required: true },
          { key: 'developerToken', label: 'Developer Token', type: 'password', placeholder: '...', description: 'Token from your Manager Account (MCC).', required: true }
        ],
        guide: {
          title: 'Google Ads API Setup',
          docsUrl: 'https://developers.google.com/google-ads/api/docs/first-call/overview',
          steps: [
            'You need a Google Ads Manager Account (MCC).',
            'Log into your MCC, go to Tools & Settings > Setup > API Center.',
            'Apply for a Developer Token (Test access is sufficient for development).',
            'The Customer ID is the 10-digit number in the top right of your Google Ads dashboard.'
          ]
        }
      },
      { 
        id: 'twitter', 
        name: 'X (Twitter) Ads', 
        icon: '<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>', 
        color: 'text-gray-900',
        isConnected: false, 
        config: {},
        fields: [
          { key: 'apiKey', label: 'API Key', type: 'text', placeholder: '...', description: 'Consumer Key from Developer Portal.', required: true },
          { key: 'apiSecret', label: 'API Secret', type: 'password', placeholder: '...', description: 'Consumer Secret.', required: true },
          { key: 'adAccountId', label: 'Ads Account ID', type: 'text', placeholder: '18ce...', description: 'Base-36 Account ID.', required: true }
        ],
        guide: {
          title: 'X Ads API Access',
          docsUrl: 'https://developer.twitter.com/en/docs/twitter-ads-api/getting-started',
          steps: [
            'Apply for Enterprise or Ads API access at developer.twitter.com.',
            'Create a Project and App to get your Keys and Tokens.',
            'Your Ads Account ID is found in the Ads Manager URL (e.g. ads.twitter.com/accounts/YOUR_ID/...).'
          ]
        }
      },
      { 
        id: 'tiktok', 
        name: 'TikTok Ads', 
        icon: '<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>', 
        color: 'text-black',
        isConnected: false, 
        config: {},
        fields: [
          { key: 'appId', label: 'App ID', type: 'text', placeholder: '...', description: 'From TikTok for Business Developers.', required: true },
          { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: '...', description: 'Long-lived access token.', required: true },
          { key: 'advertiserId', label: 'Advertiser ID', type: 'text', placeholder: '...', description: 'Target ad account ID.', required: true }
        ],
        guide: {
          title: 'TikTok Marketing API',
          docsUrl: 'https://ads.tiktok.com/marketing_api/docs',
          steps: [
            'Register as a developer on TikTok for Business.',
            'Create an App and select "Marketing API".',
            'Use the "Management" tools to generate an Access Token for your own account.',
            'The Advertiser ID is visible in your Ads Manager dashboard.'
          ]
        }
      },
      { 
        id: 'youtube', 
        name: 'YouTube', 
        icon: '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>', 
        color: 'text-red-600',
        isConnected: false, 
        config: {},
        fields: [
          { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: 'UC...', description: 'Your YouTube Channel ID.', required: true },
          { key: 'clientId', label: 'OAuth Client ID', type: 'text', placeholder: '...', description: 'From Google Cloud Console.', required: true }
        ],
        guide: {
          title: 'YouTube Data API',
          docsUrl: 'https://console.cloud.google.com/apis/library/youtube.googleapis.com',
          steps: [
            'Go to Google Cloud Console and enable "YouTube Data API v3".',
            'Create OAuth 2.0 Credentials.',
            'Your Channel ID can be found in YouTube Studio > Settings > Channel > Advanced Settings.'
          ]
        }
      }
    ];
  }
}
