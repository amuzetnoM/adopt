import { Component, inject, input, output, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService, Project, FinalAd } from '../services/storage.service';
import { GeminiService } from '../services/gemini.service';
import { AdCardComponent } from './ad-card.component';
import { IdeationCardComponent } from './ideation-card.component';
import { SetupFormComponent } from './setup-form.component';

type ProjectTab = 'overview' | 'strategy' | 'production' | 'schedule';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, AdCardComponent, IdeationCardComponent, SetupFormComponent],
  template: `
    @if (project(); as proj) {
      <div class="flex flex-col h-full bg-[#F8FAFC]">
        
        <!-- Sticky Navigation Header -->
        <div class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div class="max-w-[1920px] mx-auto px-4 md:px-8">
            <div class="h-16 flex items-center justify-between">
              
              <!-- Left: Context & Title -->
              <div class="flex items-center gap-4">
                <button (click)="onBack.emit()" class="p-2 -ml-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors" title="Back to Dashboard">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <div class="h-8 w-px bg-slate-200"></div>
                <div>
                   <h2 class="text-lg font-bold text-slate-900 leading-none truncate max-w-[200px] md:max-w-md">{{ proj.name }}</h2>
                   <p class="text-xs text-slate-500 mt-1 font-medium">{{ proj.params.industry }} Campaign</p>
                </div>
              </div>

              <!-- Center: Tabs (Desktop) -->
              <div class="hidden md:flex bg-slate-100/50 p-1 rounded-xl">
                 <button (click)="switchTab('overview')" [class]="getTabClass('overview')">Project Hub</button>
                 <button (click)="switchTab('strategy')" [class]="getTabClass('strategy')">Strategy</button>
                 <button (click)="switchTab('production')" [class]="getTabClass('production')">Production</button>
                 <button (click)="switchTab('schedule')" [class]="getTabClass('schedule')">Timeline</button>
              </div>

              <!-- Right: Actions -->
              <div class="flex items-center gap-3">
                 @if (activeTab() === 'production') {
                    <button (click)="generateAllImages()" [disabled]="isProcessing" class="text-xs font-bold bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                       Render Visuals
                    </button>
                    <button (click)="toggleSeoReport()" class="text-xs font-bold bg-white text-slate-700 px-4 py-2 rounded-lg border border-slate-200 hover:text-indigo-600 transition-all">
                       SEO Report
                    </button>
                 }
              </div>
            </div>

            <!-- Mobile Tabs -->
            <div class="md:hidden flex overflow-x-auto no-scrollbar pb-2 gap-2 mt-1">
               <button (click)="switchTab('overview')" [class]="getMobileTabClass('overview')">Hub</button>
               <button (click)="switchTab('strategy')" [class]="getMobileTabClass('strategy')">Strategy</button>
               <button (click)="switchTab('production')" [class]="getMobileTabClass('production')">Production</button>
               <button (click)="switchTab('schedule')" [class]="getMobileTabClass('schedule')">Timeline</button>
            </div>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 max-w-[1920px] mx-auto w-full relative">
          
          <!-- Processing Overlay -->
          @if (isProcessing) {
            <div class="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
               <div class="bg-white p-8 rounded-3xl shadow-2xl border border-indigo-100 flex flex-col items-center max-w-sm text-center">
                  <div class="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-6"></div>
                  <h3 class="text-xl font-bold text-slate-900 mb-2">
                     {{ processingMessage }}
                  </h3>
                  <p class="text-slate-500 text-sm">The platform is processing your request and optimizing assets.</p>
               </div>
            </div>
          }

          <!-- TAB 1: OVERVIEW DASHBOARD (Project Specification Hub) -->
          @if (activeTab() === 'overview') {
            <div class="animate-fade-in space-y-10 pb-20">
               
               <!-- Welcome Banner -->
               <div class="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                 <div>
                   <h2 class="text-3xl font-bold mb-2">Project Hub</h2>
                   <p class="text-indigo-200 max-w-xl">Monitor your live campaign performance and manage upcoming content.</p>
                 </div>
                 <div class="flex gap-3">
                    <button (click)="switchTab('strategy')" class="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg">
                       Review Strategy
                    </button>
                    <button (click)="switchTab('production')" class="bg-indigo-600 border border-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-lg">
                       Manage Production
                    </button>
                 </div>
               </div>
               
               <!-- 1. Live & Posted Section -->
               <div class="space-y-4">
                  <div class="flex items-center gap-3">
                     <div class="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                     <h3 class="text-xl font-bold text-slate-900">Live & Posted</h3>
                     <span class="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{{ liveAds().length }}</span>
                  </div>

                  @if (liveAds().length > 0) {
                     <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        @for (ad of liveAds(); track ad.id) {
                           <app-ad-card 
                              [ad]="ad"
                              (onDelete)="handleDeleteAd(ad.id)"
                              (onUnschedule)="handleUnscheduleAd(ad.id)"
                              (onSchedule)="scheduleAd(ad.id, $event)"
                              class="h-full"
                           ></app-ad-card>
                        }
                     </div>
                  } @else {
                     <div class="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                        <p class="text-slate-400">No posts have gone live yet.</p>
                     </div>
                  }
               </div>

               <!-- 2. Upcoming Schedule Section -->
               <div class="space-y-4">
                  <div class="flex items-center gap-3">
                     <div class="w-3 h-3 bg-indigo-500 rounded-full"></div>
                     <h3 class="text-xl font-bold text-slate-900">Upcoming Schedule</h3>
                     <span class="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{{ upcomingAds().length }}</span>
                  </div>

                  @if (upcomingAds().length > 0) {
                     <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        @for (ad of upcomingAds(); track ad.id) {
                           <app-ad-card 
                              [ad]="ad"
                              (onDelete)="handleDeleteAd(ad.id)"
                              (onUnschedule)="handleUnscheduleAd(ad.id)"
                              (onSchedule)="scheduleAd(ad.id, $event)"
                              class="h-full"
                           ></app-ad-card>
                        }
                     </div>
                  } @else {
                     <div class="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center flex flex-col items-center gap-4">
                        <p class="text-slate-400">Nothing scheduled for the future.</p>
                        <button (click)="switchTab('production')" class="text-indigo-600 font-bold text-sm hover:underline">Go to Production to schedule posts</button>
                     </div>
                  }
               </div>
               
               <!-- 3. Draft / Unscheduled Section -->
               <div class="space-y-4">
                  <div class="flex items-center gap-3">
                     <div class="w-3 h-3 bg-slate-300 rounded-full"></div>
                     <h3 class="text-xl font-bold text-slate-900">Asset Library (Drafts)</h3>
                     <span class="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold">{{ draftAds().length }}</span>
                  </div>

                   @if (draftAds().length > 0) {
                     <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        @for (ad of draftAds(); track ad.id) {
                           <app-ad-card 
                              [ad]="ad"
                              (onDelete)="handleDeleteAd(ad.id)"
                              (onGenerateImage)="generateImageForAd(ad)"
                              (onSchedule)="scheduleAd(ad.id, $event)"
                              class="h-full"
                           ></app-ad-card>
                        }
                     </div>
                  } @else {
                     <div class="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                        <p class="text-slate-400">No drafts available.</p>
                     </div>
                  }
               </div>

            </div>
          }

          <!-- TAB 2: STRATEGY (IDEATION) -->
          @if (activeTab() === 'strategy') {
            <div class="animate-fade-in pb-32"> <!-- Padding for floating bar -->
               @if (proj.ideationConcepts.length === 0) {
                 <!-- Empty State Generator -->
                 <div class="max-w-xl mx-auto text-center py-12">
                    <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
                    </div>
                    <h2 class="text-2xl font-bold text-slate-900 mb-2">Strategy & Ideation</h2>
                    <p class="text-slate-500 mb-8">Generate strategic angles and concepts based on your brand profile.</p>
                    
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-left">
                       <label class="block text-sm font-bold text-slate-700 mb-2">Concept Count</label>
                       <input type="range" [(ngModel)]="generationCount" min="3" max="10" class="w-full mb-4 accent-indigo-600">
                       <button (click)="runIdeation()" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">Generate {{ generationCount }} Concepts</button>
                    </div>
                 </div>
               } @else {
                 <!-- Concept Grid -->
                 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    @for (concept of proj.ideationConcepts; track concept.id) {
                       <app-ideation-card 
                          [concept]="concept"
                          (toggle)="toggleConceptSelection(concept.id)"
                          class="h-full animate-fade-in-up"
                          [style.animation-delay]="$index * 50 + 'ms'"
                       ></app-ideation-card>
                    }
                 </div>

                 <!-- Navigation Footer -->
                 <div class="mt-12 p-8 border-t border-slate-200 text-center">
                    @if (selectedCount() === 0) {
                        <p class="text-slate-500 mb-4">Select at least one concept above to proceed to production.</p>
                        <button disabled class="bg-slate-200 text-slate-400 px-8 py-3 rounded-xl font-bold cursor-not-allowed">Proceed to Production</button>
                    } @else {
                        <p class="text-slate-500 mb-4">{{ selectedCount() }} concept(s) selected.</p>
                        <button (click)="generateFinals()" class="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1">
                          Proceed to Production &rarr;
                        </button>
                    }
                 </div>
               }
            </div>

            <!-- Workflow Bar (Sticky Bottom) -->
            @if (selectedCount() > 0) {
               <div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white pl-6 pr-2 py-2 rounded-full shadow-2xl z-50 flex items-center gap-6 animate-slide-up border border-slate-700">
                  <div class="flex flex-col">
                     <span class="font-bold text-sm leading-none">{{ selectedCount() }} Selected</span>
                     <span class="text-[10px] text-slate-400">Ready for production</span>
                  </div>
                  <button (click)="generateFinals()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg flex items-center gap-2">
                     Proceed to Production
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                  </button>
               </div>
            }
          }

          <!-- TAB 3: PRODUCTION -->
          @if (activeTab() === 'production') {
             <div class="animate-fade-in">
                @if (proj.finalAds.length === 0) {
                   <div class="text-center py-20">
                      <p class="text-slate-400">No assets generated yet. Go to the Strategy tab and select concepts.</p>
                      <button (click)="switchTab('strategy')" class="mt-4 text-indigo-600 font-bold hover:underline">Back to Strategy</button>
                   </div>
                } @else {
                   <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pb-12">
                      @for (ad of proj.finalAds; track ad.id) {
                         <app-ad-card 
                            [ad]="ad"
                            (onDelete)="handleDeleteAd(ad.id)"
                            (onUnschedule)="handleUnscheduleAd(ad.id)"
                            (onGenerateImage)="generateImageForAd(ad)"
                            (onSchedule)="scheduleAd(ad.id, $event)"
                            class="h-full animate-fade-in"
                         ></app-ad-card>
                      }
                   </div>
                }
             </div>
          }

          <!-- TAB 4: SCHEDULE -->
          @if (activeTab() === 'schedule') {
             <div class="animate-fade-in max-w-4xl mx-auto">
                <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                   <div class="p-6 border-b border-slate-100 bg-slate-50">
                      <h3 class="font-bold text-lg text-slate-900">Campaign Timeline</h3>
                   </div>
                   <div class="divide-y divide-slate-100">
                      @for (ad of sortedAds(); track ad.id) {
                         <div class="p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-slate-50 transition-colors">
                            <div class="w-full md:w-32 h-32 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200 relative">
                               <img *ngIf="ad.imageUrl" [src]="ad.imageUrl" class="w-full h-full object-cover">
                               <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button (click)="handleUnscheduleAd(ad.id)" class="text-white hover:text-red-300 text-xs font-bold">Unschedule</button>
                               </div>
                            </div>
                            <div class="flex-1">
                               <div class="flex items-center gap-2 mb-2">
                                  <span class="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">{{ ad.platform }}</span>
                                  <span class="text-xs text-slate-400">{{ ad.scheduledTime | date:'medium' }}</span>
                               </div>
                               <h4 class="font-bold text-slate-900 mb-2">{{ ad.headline }}</h4>
                               <p class="text-sm text-slate-600 line-clamp-2">{{ ad.body }}</p>
                            </div>
                            <div class="shrink-0 text-right">
                               <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                                  <span class="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Scheduled
                               </span>
                            </div>
                         </div>
                      }
                      @if (sortedAds().length === 0) {
                         <div class="p-12 text-center text-slate-400">
                            No posts scheduled. Schedule items from the Production tab.
                         </div>
                      }
                   </div>
                </div>
             </div>
          }

          <!-- SEO Report Modal -->
          @if (showSeoReport) {
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" (click)="toggleSeoReport()"></div>
              
              <div class="bg-white w-full max-w-3xl h-[80vh] rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-scale-in">
                <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                   <h3 class="font-bold text-xl text-slate-900">SEO Report</h3>
                   <button (click)="toggleSeoReport()" class="p-2 hover:bg-white rounded-full"><svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                </div>
                <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                   @if (proj.seoReport) {
                      <div class="prose prose-indigo max-w-none" [innerHTML]="proj.seoReport"></div>
                   } @else {
                      <div class="text-center py-20">
                         <button (click)="generateSeoReport()" [disabled]="isProcessing" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">Generate Report</button>
                      </div>
                   }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
    
    @keyframes slide-up { from { transform: translate(-50%, 100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
    .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
  `]
})
export class ProjectDetailComponent implements OnInit {
  projectId = input.required<string>();
  storage = inject(StorageService);
  gemini = inject(GeminiService);
  onBack = output<void>();

  activeTab = signal<ProjectTab>('overview');
  isProcessing = false;
  processingMessage = '';
  generationCount = 3;
  showSeoReport = false;

  project = computed(() => this.storage.getProject(this.projectId()));

  selectedCount = computed(() => {
    return this.project()?.ideationConcepts.filter(c => c.isSelected).length || 0;
  });

  // Filter ads that have a schedule time
  sortedAds = computed(() => {
    return (this.project()?.finalAds || [])
      .filter(ad => !!ad.scheduledTime)
      .sort((a, b) => (a.scheduledTime! - b.scheduledTime!));
  });

  // Hub Computed Properties
  liveAds = computed(() => {
    const now = Date.now();
    return (this.project()?.finalAds || [])
      .filter(ad => ad.scheduledTime && ad.scheduledTime <= now)
      .sort((a, b) => b.scheduledTime! - a.scheduledTime!);
  });

  upcomingAds = computed(() => {
    const now = Date.now();
    return (this.project()?.finalAds || [])
      .filter(ad => ad.scheduledTime && ad.scheduledTime > now)
      .sort((a, b) => a.scheduledTime! - b.scheduledTime!);
  });

  draftAds = computed(() => {
    return (this.project()?.finalAds || [])
      .filter(ad => !ad.scheduledTime);
  });

  ngOnInit() {
    // Default to Overview Hub
    this.activeTab.set('overview');
  }

  switchTab(tab: ProjectTab) {
    this.activeTab.set(tab);
  }

  getTabClass(tab: ProjectTab) {
    const base = "px-4 py-1.5 rounded-lg text-sm font-bold transition-all ";
    return this.activeTab() === tab 
      ? base + "bg-white text-slate-900 shadow-sm text-indigo-600" 
      : base + "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50";
  }

  getMobileTabClass(tab: ProjectTab) {
    const base = "px-4 py-2 rounded-full text-xs font-bold border shrink-0 ";
    return this.activeTab() === tab
      ? base + "bg-slate-900 text-white border-slate-900"
      : base + "bg-white text-slate-500 border-slate-200";
  }

  // --- LOGIC ---

  async runIdeation() {
    const proj = this.project();
    if (!proj) return;

    this.isProcessing = true;
    this.processingMessage = `Developing ${this.generationCount} Strategic Concepts...`;

    try {
      const concepts = await this.gemini.generateIdeationConcepts(proj.params, this.generationCount);
      this.storage.updateProject(this.projectId(), { 
        ideationConcepts: concepts,
        stage: 'ideation',
        status: 'ideation'
      });
    } catch (e) {
      console.error(e);
      alert('Optimization failed. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

  toggleConceptSelection(conceptId: string) {
    const proj = this.project();
    if (!proj) return;
    
    const updated = proj.ideationConcepts.map(c => 
      c.id === conceptId ? { ...c, isSelected: !c.isSelected } : c
    );
    this.storage.updateProject(this.projectId(), { ideationConcepts: updated });
  }

  async generateFinals() {
    const proj = this.project();
    if (!proj) return;

    const selected = proj.ideationConcepts.filter(c => c.isSelected);
    if (selected.length === 0) return;

    this.isProcessing = true;
    this.processingMessage = 'Producing Assets & Copy...';

    try {
      const finalAds = await this.gemini.generateFinalAds(proj.params, selected);
      
      this.storage.updateProject(this.projectId(), { 
        finalAds,
        stage: 'final',
        status: 'production'
      });
      
      this.activeTab.set('production');
      this.processingMessage = 'Rendering Initial Visuals...';
      
      // Auto-start images to be helpful
      await Promise.allSettled(finalAds.map(ad => this.generateImageForAd(ad)));
      this.storage.updateProject(this.projectId(), { status: 'completed' });

    } catch (e) {
      console.error(e);
      alert('Production failed.');
    } finally {
      this.isProcessing = false;
    }
  }

  async generateImageForAd(ad: FinalAd) {
    if (ad.imageUrl || ad.isLoadingImage) return; 

    this.updateLocalAd(ad.id, { isLoadingImage: true });
    try {
      const imageUrl = await this.gemini.generateAdImage(ad.visualPrompt);
      this.updateLocalAd(ad.id, { isLoadingImage: false, imageUrl: imageUrl || undefined });
    } catch (e) {
      this.updateLocalAd(ad.id, { isLoadingImage: false });
    }
  }

  async generateAllImages() {
    const proj = this.project();
    if (!proj) return;
    const pendingAds = proj.finalAds.filter(ad => !ad.imageUrl && !ad.isLoadingImage);
    if (pendingAds.length === 0) return;
    
    this.isProcessing = true;
    this.processingMessage = `Rendering ${pendingAds.length} Visuals...`;
    
    // We don't await this blocking UI forever, just trigger them
    pendingAds.forEach(ad => this.generateImageForAd(ad));
    
    // Minimal delay to show interaction
    setTimeout(() => this.isProcessing = false, 1500);
  }

  scheduleAd(adId: string, timestamp: number) {
     this.updateLocalAd(adId, { scheduledTime: timestamp });
     
     // UX Requirement: Send user back to Project Hub (Overview)
     setTimeout(() => {
       this.switchTab('overview');
       // Scroll to top
       const container = document.querySelector('.custom-scrollbar');
       if(container) container.scrollTop = 0;
     }, 300);
  }

  handleDeleteAd(adId: string) {
    if (confirm('Are you sure you want to delete this ad? This cannot be undone.')) {
      this.storage.deleteAd(this.projectId(), adId);
    }
  }

  handleUnscheduleAd(adId: string) {
    this.storage.unscheduleAd(this.projectId(), adId);
  }

  toggleSeoReport() {
    this.showSeoReport = !this.showSeoReport;
  }

  async generateSeoReport() {
    const proj = this.project();
    if (!proj) return;
    
    this.isProcessing = true;
    this.processingMessage = 'Analyzing Content & Keywords...';
    try {
       const report = await this.gemini.generateProjectSeoReport(proj);
       this.storage.updateProject(this.projectId(), { seoReport: report });
    } catch (e) {
       console.error(e);
       alert('Report generation failed.');
    } finally {
       this.isProcessing = false;
    }
  }

  private updateLocalAd(adId: string, changes: Partial<FinalAd>) {
    const proj = this.project();
    if (!proj) return;
    const updated = proj.finalAds.map(a => a.id === adId ? { ...a, ...changes } : a);
    this.storage.updateProject(this.projectId(), { finalAds: updated });
  }
}