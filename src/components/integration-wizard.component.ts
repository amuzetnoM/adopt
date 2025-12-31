import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { StorageService, Integration, PlatformId } from '../services/storage.service';

type WizardStep = 'select' | 'configure' | 'connecting' | 'success' | 'manage';

@Component({
  selector: 'app-integration-wizard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-6xl mx-auto py-8 md:py-12 px-4 md:px-6">
      
      <!-- Header -->
      <div class="mb-8 md:mb-10 text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Platform Integration Hub</h1>
        <p class="text-gray-500 max-w-2xl mx-auto">Connect your advertising and social accounts. This setup requires API credentials to ensure a secure, direct connection to your business assets.</p>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
        
        <!-- Progress Bar (Only for Wizard flow) -->
        @if (currentStep() !== 'manage') {
          <div class="bg-gray-50 border-b border-gray-200 p-4">
            <div class="flex items-center justify-center space-x-2 md:space-x-4">
              <div class="flex items-center gap-2">
                <span [class]="'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors ' + (currentStep() === 'select' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white')">
                  @if(currentStep() !== 'select') { ✓ } @else { 1 }
                </span>
                <span class="text-sm font-medium text-gray-700 hidden md:inline">Select Platforms</span>
              </div>
              <div class="w-8 md:w-16 h-0.5 bg-gray-300"></div>
              <div class="flex items-center gap-2">
                <span [class]="'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors ' + (currentStep() === 'configure' || currentStep() === 'connecting' ? 'bg-blue-600 text-white' : (currentStep() === 'success' ? 'bg-green-500 text-white' : 'bg-white border border-gray-300 text-gray-400'))">
                  @if(currentStep() === 'success') { ✓ } @else { 2 }
                </span>
                <span class="text-sm font-medium text-gray-700 hidden md:inline">Configure & Verify</span>
              </div>
              <div class="w-8 md:w-16 h-0.5 bg-gray-300"></div>
              <div class="flex items-center gap-2">
                <span [class]="'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors ' + (currentStep() === 'success' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-400')">3</span>
                <span class="text-sm font-medium text-gray-700 hidden md:inline">Complete</span>
              </div>
            </div>
          </div>
        }

        <div class="flex-1 flex flex-col">
          
          <!-- STEP 1: Select Platforms -->
          @if (currentStep() === 'select') {
            <div class="p-8 animate-fade-in flex-1">
              <div class="flex justify-between items-center mb-6">
                 <h2 class="text-xl font-bold text-gray-800">Available Channels</h2>
                 <span class="text-sm text-gray-500">{{ selectedIds().size }} selected</span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                @for (platform of availablePlatforms(); track platform.id) {
                  <div 
                    (click)="toggleSelection(platform.id)"
                    [class]="'cursor-pointer border rounded-xl p-5 transition-all relative overflow-hidden group ' + (selectedIds().has(platform.id) ? 'border-blue-500 bg-blue-50/50 shadow-md' : 'border-gray-200 hover:border-blue-300 bg-white hover:shadow-sm')"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <div [class]="'w-12 h-12 rounded-lg flex items-center justify-center bg-white shadow-sm border border-gray-100 ' + platform.color">
                        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="platform.icon"></svg>
                      </div>
                      <div [class]="'w-6 h-6 rounded-full border flex items-center justify-center transition-colors ' + (selectedIds().has(platform.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white group-hover:border-blue-400')">
                         <svg *ngIf="selectedIds().has(platform.id)" class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"></path></svg>
                      </div>
                    </div>
                    
                    <h3 class="font-bold text-gray-900 mb-1">{{ platform.name }}</h3>
                    <p class="text-xs text-gray-500 leading-relaxed">
                      @if(platform.isConnected) { <span class="text-green-600 font-medium">● Connected</span> } 
                      @else { Connect to sync ads & insights. }
                    </p>
                  </div>
                }
              </div>
              <div class="mt-10 flex justify-end pt-6 border-t border-gray-100">
                <button 
                  (click)="proceedToConfig()" 
                  [disabled]="selectedIds().size === 0"
                  class="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
                >
                  Configure Selection
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          }

          <!-- STEP 2: Configure Platforms (Split View) -->
          @if (currentStep() === 'configure') {
             <div class="flex flex-col md:flex-row h-full animate-fade-in flex-1">
                
                <!-- Left: Form -->
                <div class="w-full md:w-1/2 p-8 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200">
                   <div class="flex items-center gap-4 mb-8">
                      <div [class]="'w-14 h-14 rounded-xl flex items-center justify-center bg-gray-50 ' + currentConfigPlatform()?.color">
                         <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="currentConfigPlatform()?.icon"></svg>
                      </div>
                      <div>
                        <h2 class="text-2xl font-bold text-gray-900">{{ currentConfigPlatform()?.name }}</h2>
                        <div class="flex items-center gap-2 text-sm text-gray-500">
                           <span>Configuration</span>
                           <span class="w-1 h-1 rounded-full bg-gray-400"></span>
                           <span>Step {{ configIndex() + 1 }} of {{ selectedIds().size }}</span>
                        </div>
                      </div>
                   </div>

                   <form [formGroup]="configForm" (ngSubmit)="saveConfig()" class="space-y-6">
                      
                      @for (field of currentConfigPlatform()?.fields; track field.key) {
                        <div class="space-y-2">
                           <div class="flex justify-between">
                             <label [for]="field.key" class="block text-sm font-semibold text-gray-800">{{ field.label }}</label>
                             @if (!field.required) { <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Optional</span> }
                           </div>
                           <input 
                             [id]="field.key"
                             [type]="field.type" 
                             [formControlName]="field.key" 
                             [placeholder]="field.placeholder"
                             class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                           >
                           <p class="text-xs text-gray-500">{{ field.description }}</p>
                        </div>
                      }

                      <div class="pt-6">
                         <button type="submit" [disabled]="configForm.invalid" class="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-2">
                           Verify & Connect
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                             <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                           </svg>
                         </button>
                      </div>
                   </form>
                </div>

                <!-- Right: Guide -->
                <div class="w-full md:w-1/2 bg-gray-50 p-8 overflow-y-auto">
                   <div class="sticky top-0">
                      <div class="flex items-center gap-2 mb-6 text-gray-900">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-blue-600">
                           <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                         </svg>
                         <h3 class="font-bold text-lg">Setup Guide</h3>
                      </div>

                      <div class="prose prose-sm prose-blue text-gray-600">
                         <h4 class="text-gray-900 font-semibold mb-3">{{ currentConfigPlatform()?.guide?.title }}</h4>
                         <ol class="space-y-4 list-decimal list-inside marker:text-blue-600 marker:font-bold">
                            @for (step of currentConfigPlatform()?.guide?.steps; track step) {
                              <li class="leading-relaxed pl-2">{{ step }}</li>
                            }
                         </ol>
                         
                         <div class="mt-8 pt-6 border-t border-gray-200">
                            <a [href]="currentConfigPlatform()?.guide?.docsUrl" target="_blank" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors group">
                               Read Official Documentation
                               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 transition-transform group-hover:translate-x-1">
                                 <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                               </svg>
                            </a>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          }

          <!-- STEP 3: Connecting Simulation -->
          @if (currentStep() === 'connecting') {
             <div class="h-full flex flex-col items-center justify-center p-12 animate-fade-in flex-1">
                <div class="relative w-24 h-24 mb-8">
                   <div class="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                   <div class="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                   <div class="absolute inset-0 flex items-center justify-center">
                      <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                         <svg class="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="currentConfigPlatform()?.icon"></svg>
                      </div>
                   </div>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Verifying Credentials</h3>
                <p class="text-gray-500 text-center max-w-md">Securely connecting to {{ currentConfigPlatform()?.name }} API and validating permissions...</p>
             </div>
          }

          <!-- STEP 4: Success / Manage View -->
          @if (currentStep() === 'success' || currentStep() === 'manage') {
            <div class="p-8 animate-fade-in flex-1 flex flex-col">
               @if (currentStep() === 'success') {
                 <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left shadow-sm">
                    <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                      <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-xl font-bold text-green-900 mb-1">Integration Setup Complete!</h3>
                      <p class="text-green-700">All selected platforms have been successfully verified and connected. You can now use them in your ad campaigns.</p>
                    </div>
                 </div>
               }

               <div class="flex items-center justify-between mb-6">
                 <h2 class="text-xl font-bold text-gray-800">Connected Platforms</h2>
                 @if (currentStep() === 'manage') {
                   <button (click)="addMore()" class="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                     + Add Connection
                   </button>
                 }
               </div>
               
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 @for (platform of availablePlatforms(); track platform.id) {
                    <div class="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
                       <div class="flex items-start justify-between mb-4">
                          <div class="flex items-center gap-4">
                            <div [class]="'w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50 ' + platform.color">
                               <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="platform.icon"></svg>
                            </div>
                            <div>
                               <h3 class="font-bold text-gray-900">{{ platform.name }}</h3>
                               @if (platform.isConnected) {
                                  <div class="flex items-center gap-2 mt-1">
                                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span class="text-xs text-gray-500 font-medium">Active</span>
                                  </div>
                               } @else {
                                  <span class="text-xs text-gray-400 mt-1 block">Not Configured</span>
                               }
                            </div>
                          </div>
                          
                          <div class="relative">
                            <!-- Status Indicator or Menu could go here -->
                          </div>
                       </div>
                       
                       <div class="pt-4 border-t border-gray-100 mt-auto">
                          @if (platform.isConnected) {
                             <div class="flex items-center justify-between">
                               <span class="text-xs text-gray-400">Synced: Just now</span>
                               <button (click)="disconnect(platform.id)" class="text-red-500 hover:text-red-600 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors">
                                 Disconnect
                               </button>
                             </div>
                          } @else {
                             <button (click)="connectSingle(platform.id)" class="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-gray-200">
                                Set Up Connection
                             </button>
                          }
                       </div>
                    </div>
                 }
               </div>

               @if (currentStep() === 'success') {
                  <div class="mt-auto pt-8 flex justify-end">
                    <button (click)="finishWizard()" class="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg">
                      Go to Dashboard
                    </button>
                  </div>
               }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.4s ease-out forwards;
    }
  `]
})
export class IntegrationWizardComponent {
  storage = inject(StorageService);
  fb = inject(FormBuilder);

  currentStep = signal<WizardStep>('manage');
  selectedIds = signal<Set<PlatformId>>(new Set());
  
  // Logic for configuration loop
  configQueue = signal<PlatformId[]>([]);
  configIndex = signal(0);
  
  configForm: FormGroup;

  availablePlatforms = computed(() => this.storage.integrations());

  currentConfigPlatform = computed(() => {
    const id = this.configQueue()[this.configIndex()];
    return this.storage.integrations().find(i => i.id === id);
  });

  constructor() {
    this.configForm = this.fb.group({});

    // Watch for platform changes to rebuild the form dynamically
    effect(() => {
      const platform = this.currentConfigPlatform();
      if (platform && (this.currentStep() === 'configure')) {
        this.rebuildForm(platform);
      }
    });

    // Initial State Check
    if (!this.storage.integrations().some(i => i.isConnected)) {
      this.currentStep.set('select');
    }
  }

  rebuildForm(platform: Integration) {
    const group: Record<string, FormControl> = {};
    platform.fields.forEach(field => {
      const validators = field.required ? [Validators.required] : [];
      // Pre-fill if exists
      const initialValue = platform.config[field.key] || '';
      group[field.key] = new FormControl(initialValue, validators);
    });
    this.configForm = this.fb.group(group);
  }

  toggleSelection(id: PlatformId) {
    this.selectedIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  proceedToConfig() {
    const queue = Array.from(this.selectedIds());
    if (queue.length > 0) {
      this.configQueue.set(queue);
      this.configIndex.set(0);
      this.currentStep.set('configure');
    }
  }

  saveConfig() {
    if (this.configForm.invalid) return;

    const currentId = this.configQueue()[this.configIndex()];
    const formVal = this.configForm.value;

    // Simulate connecting state
    this.currentStep.set('connecting');

    setTimeout(() => {
      // Save data
      this.storage.updateIntegration(currentId, {
        isConnected: true,
        config: formVal,
        lastSync: Date.now()
      });

      // Move next
      if (this.configIndex() < this.configQueue().length - 1) {
        this.configIndex.update(i => i + 1);
        this.currentStep.set('configure');
      } else {
        this.currentStep.set('success');
      }
    }, 2000); // 2s delay for "Verification" simulation
  }

  finishWizard() {
    this.currentStep.set('manage');
    this.selectedIds.set(new Set());
  }

  addMore() {
    this.currentStep.set('select');
    this.selectedIds.set(new Set());
  }

  // --- Manage View Actions ---

  disconnect(id: PlatformId) {
    if(confirm('Are you sure you want to disconnect this platform? Automated campaigns will pause immediately.')) {
      this.storage.updateIntegration(id, { isConnected: false, config: {} });
    }
  }

  connectSingle(id: PlatformId) {
    this.selectedIds.set(new Set([id]));
    this.proceedToConfig();
  }
}