import { Component, inject, input, output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService, Project, ProjectParams, IdeationConcept, FinalAd } from '../services/storage.service';
import { GeminiService } from '../services/gemini.service';
import { AdCardComponent } from './ad-card.component';
import { IdeationCardComponent } from './ideation-card.component';
import { SetupFormComponent } from './setup-form.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, AdCardComponent, IdeationCardComponent, SetupFormComponent],
  template: `
    @if (project) {
      <div class="flex flex-col h-full bg-[#F8FAFC]">
        
        <!-- Header -->
        <div class="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 md:px-10 py-4 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-40 transition-all">
          <div class="flex items-center gap-4 mb-4 md:mb-0">
            <button (click)="onBack.emit()" class="p-2 -ml-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-900 transition-colors group">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <div class="flex items-center gap-3">
                 <h2 class="text-xl font-bold text-slate-900">{{ project.name }}</h2>
                 <span [class]="'px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ' + (project.stage === 'ideation' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')">
                   {{ project.stage === 'ideation' ? 'Phase 1: Ideation' : 'Phase 2: Production' }}
                 </span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
             @if (project.stage === 'ideation') {
                <span class="text-sm font-medium text-slate-500 hidden md:inline">
                   {{ selectedCount() }} selected
                </span>
                <button 
                   (click)="generateFinals()" 
                   [disabled]="selectedCount() === 0 || isProcessing"
                   class="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                   @if (isProcessing) { <span class="animate-spin">⟳</span> Processing... } 
                   @else { Generate Finals → }
                </button>
             } @else {
                <button (click)="toggleSeoReport()" class="px-4 py-2 text-xs font-bold bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>
                   SEO Report
                </button>
                <button (click)="generateAllImages()" [disabled]="isProcessing" class="px-4 py-2 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 border border-indigo-200 transition-all">
                   Generate All Visuals
                </button>
                <button (click)="backToIdeation()" class="text-sm text-slate-500 hover:text-slate-900 underline underline-offset-4 ml-2">
                  Back to Ideation
                </button>
             }
          </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
          
          <!-- Loading Overlay -->
          @if (isProcessing) {
            <div class="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
               <div class="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center max-w-sm text-center">
                  <div class="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-6"></div>
                  <h3 class="text-xl font-bold text-slate-900 mb-2">
                     {{ processingMessage }}
                  </h3>
                  <p class="text-slate-500 text-sm">Our AI is analyzing your brand parameters and crafting strategic concepts.</p>
               </div>
            </div>
          }

          <!-- STATE: EMPTY / SETUP -->
          @if (project.ideationConcepts.length === 0 && !isProcessing) {
             <div class="max-w-2xl mx-auto text-center pt-10">
                <div class="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-indigo-600">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                   </svg>
                </div>
                <h2 class="text-3xl font-bold text-slate-900 mb-4">Let's Brainstorm Ideas</h2>
                <p class="text-lg text-slate-600 mb-8 leading-relaxed">
                   How many initial concepts should we explore? We'll generate a variety of angles, moods, and visual styles for you to choose from.
                </p>
                
                <div class="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 inline-block w-full text-left">
                   <label class="block text-sm font-bold text-slate-700 mb-4">Generation Count (3 - 30)</label>
                   <div class="flex items-center gap-6 mb-8">
                      <input 
                        type="range" 
                        [(ngModel)]="generationCount" 
                        min="3" 
                        max="30" 
                        step="1"
                        class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      >
                      <span class="text-2xl font-bold text-indigo-600 w-12 text-center">{{ generationCount }}</span>
                   </div>
                   
                   <button (click)="runIdeation()" class="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5 transition-all">
                      Generate Concepts
                   </button>
                </div>
             </div>
          }

          <!-- STATE: IDEATION VIEW -->
          @if (project.ideationConcepts.length > 0 && project.stage === 'ideation') {
             <div class="mb-8 flex items-end justify-between">
                <div>
                   <h3 class="text-2xl font-bold text-slate-900">Select Your Favorites</h3>
                   <p class="text-slate-500 mt-1">Pick the best ideas to move into production.</p>
                </div>
                <!-- Mini controls -->
                <div class="text-sm text-slate-400">
                   Showing {{ project.ideationConcepts.length }} concepts
                </div>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                @for (concept of project.ideationConcepts; track concept.id) {
                   <app-ideation-card 
                      [concept]="concept"
                      (toggle)="toggleConceptSelection(concept.id)"
                   ></app-ideation-card>
                }
             </div>
          }

          <!-- STATE: PRODUCTION VIEW -->
          @if (project.finalAds.length > 0 && project.stage === 'final') {
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                @for (ad of project.finalAds; track ad.id) {
                   <app-ad-card 
                      [ad]="ad"
                      (onGenerateImage)="generateImageForAd(ad)"
                      (onSchedule)="scheduleAd(ad.id, $event)"
                   ></app-ad-card>
                }
             </div>
          }

          <!-- SEO REPORT MODAL -->
          @if (showSeoReport) {
            <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="toggleSeoReport()"></div>
              <div class="bg-white w-full max-w-3xl h-[80vh] rounded-3xl shadow-2xl relative flex flex-col overflow-hidden animate-fade-in-down">
                
                <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                   <div class="flex items-center gap-3">
                     <div class="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>
                     </div>
                     <h3 class="font-bold text-xl text-slate-900">Campaign SEO Report</h3>
                   </div>
                   <button (click)="toggleSeoReport()" class="p-2 hover:bg-white rounded-full transition-colors text-slate-500">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>

                <div class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                   @if (project.seoReport) {
                      <div class="prose prose-indigo max-w-none" [innerHTML]="project.seoReport"></div>
                   } @else {
                      <div class="flex flex-col items-center justify-center h-64 text-center">
                         <p class="text-slate-500 mb-6 max-w-md">No report generated yet. Analyze your campaign content against current search trends and best practices.</p>
                         <button (click)="generateSeoReport()" [disabled]="isProcessing" class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                           @if(isProcessing) { <span class="animate-spin">⟳</span> Analyzing... } 
                           @else { Generate Full Report }
                         </button>
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
    @keyframes fade-in-down {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-down {
      animation: fade-in-down 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  `]
})
export class ProjectDetailComponent {
  projectId = input.required<string>();
  storage = inject(StorageService);
  gemini = inject(GeminiService);
  onBack = output<void>();

  isProcessing = false;
  processingMessage = '';
  generationCount = 3;
  showSeoReport = false;

  get project(): Project | undefined {
    return this.storage.getProject(this.projectId());
  }

  selectedCount = computed(() => {
    return this.project?.ideationConcepts.filter(c => c.isSelected).length || 0;
  });

  // --- STAGE 1 LOGIC ---

  async runIdeation() {
    const proj = this.project;
    if (!proj) return;

    this.isProcessing = true;
    this.processingMessage = `Brainstorming ${this.generationCount} Concepts...`;

    try {
      const concepts = await this.gemini.generateIdeationConcepts(proj.params, this.generationCount);
      this.storage.updateProject(this.projectId(), { 
        ideationConcepts: concepts,
        stage: 'ideation',
        status: 'ideation'
      });
    } catch (e) {
      console.error(e);
      alert('Failed to generate ideas.');
    } finally {
      this.isProcessing = false;
    }
  }

  toggleConceptSelection(conceptId: string) {
    const proj = this.project;
    if (!proj) return;
    
    const updated = proj.ideationConcepts.map(c => 
      c.id === conceptId ? { ...c, isSelected: !c.isSelected } : c
    );
    this.storage.updateProject(this.projectId(), { ideationConcepts: updated });
  }

  // --- STAGE 2 LOGIC ---

  async generateFinals() {
    const proj = this.project;
    if (!proj) return;

    const selected = proj.ideationConcepts.filter(c => c.isSelected);
    if (selected.length === 0) return;

    this.isProcessing = true;
    this.processingMessage = 'Producing Final Assets...';

    try {
      // 1. Generate text ads
      const finalAds = await this.gemini.generateFinalAds(proj.params, selected);
      
      this.storage.updateProject(this.projectId(), { 
        finalAds,
        stage: 'final',
        status: 'production'
      });

      // 2. Start image generation in background for each
      // We do this concurrently but handled safely
      this.processingMessage = 'Rendering visuals...';
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
    if (ad.imageUrl || ad.isLoadingImage) return; // Skip if already done or in progress

    this.updateLocalAd(ad.id, { isLoadingImage: true });
    try {
      const imageUrl = await this.gemini.generateAdImage(ad.visualPrompt);
      if (imageUrl) {
        this.updateLocalAd(ad.id, { imageUrl, isLoadingImage: false });
      } else {
        this.updateLocalAd(ad.id, { isLoadingImage: false });
      }
    } catch (e) {
      this.updateLocalAd(ad.id, { isLoadingImage: false });
    }
  }

  async generateAllImages() {
    const proj = this.project;
    if (!proj) return;

    // Filter ads that don't have images yet
    const pendingAds = proj.finalAds.filter(ad => !ad.imageUrl && !ad.isLoadingImage);
    
    if (pendingAds.length === 0) return;

    // Trigger them all
    await Promise.allSettled(pendingAds.map(ad => this.generateImageForAd(ad)));
  }

  scheduleAd(adId: string, timestamp: number) {
     this.updateLocalAd(adId, { scheduledTime: timestamp });
  }

  backToIdeation() {
    this.storage.updateProject(this.projectId(), { stage: 'ideation' });
  }

  toggleSeoReport() {
    this.showSeoReport = !this.showSeoReport;
  }

  async generateSeoReport() {
    const proj = this.project;
    if (!proj) return;
    
    this.isProcessing = true;
    try {
       const report = await this.gemini.generateProjectSeoReport(proj);
       this.storage.updateProject(this.projectId(), { seoReport: report });
    } catch (e) {
       console.error(e);
       alert('Failed to generate SEO report.');
    } finally {
       this.isProcessing = false;
    }
  }

  private updateLocalAd(adId: string, changes: Partial<FinalAd>) {
    const proj = this.project;
    if (!proj) return;
    const updated = proj.finalAds.map(a => a.id === adId ? { ...a, ...changes } : a);
    this.storage.updateProject(this.projectId(), { finalAds: updated });
  }
}