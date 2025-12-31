import { Component, output, signal, inject, input, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../services/gemini.service';
import { ProjectParams } from '../services/storage.service';

@Component({
  selector: 'app-setup-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="neo-raised bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden">
      
      <!-- Header -->
      @if (mode() === 'create') {
        <div class="p-6 md:p-10">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Campaign Strategy</h2>
          <p class="text-gray-600 mt-2 text-base md:text-lg">Define the core parameters for your new advertising campaign.</p>
        </div>
      }

      <div class="p-6 md:p-10 pb-0">
        <!-- Smart Extraction Area -->
        <div class="neo-inset bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-1 mb-8 md:mb-10">
          <div class="p-5 md:p-8">
            <div class="flex items-center gap-2 mb-6">
                 <div class="p-2 neo-flat bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                   <svg class="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
                 </div>
                 <h3 class="text-sm font-bold text-indigo-900 uppercase tracking-wider">Smart Brand Extractor</h3>
            </div>
            
            <div class="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              
              <!-- Option 1: Website Link -->
              <div class="w-full lg:w-1/2 space-y-4">
                 <div>
                   <h4 class="font-bold text-gray-800 text-sm">Option 1: Analyze Website</h4>
                   <p class="text-xs text-gray-600 mt-1">We'll scan your site to understand the brand.</p>
                 </div>
                 <div class="flex flex-col sm:flex-row gap-3">
                    <input 
                      [formControl]="urlControl" 
                      type="url" 
                      placeholder="https://example.com" 
                      class="flex-1 px-4 py-3 rounded-xl neo-inset bg-white focus:neo-flat text-sm outline-none w-full text-gray-800 font-medium transition-all"
                    >
                    <button 
                      (click)="analyzeUrl()" 
                      [disabled]="urlControl.invalid || !urlControl.value || isAnalyzing()"
                      class="neo-raised bg-gradient-to-br from-indigo-500 to-indigo-600 hover:neo-hover text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 text-sm active:neo-inset"
                    >
                      {{ isAnalyzing() && analyzeType() === 'url' ? 'Scanning...' : 'Scan Site' }}
                    </button>
                 </div>
              </div>

              <div class="hidden lg:block w-px h-32 neo-inset bg-indigo-100 self-center"></div>

              <!-- Option 2: File Upload -->
              <div class="w-full lg:w-1/2 space-y-4">
                  <div>
                    <h4 class="font-bold text-gray-800 text-sm">Option 2: Upload Asset</h4>
                    <p class="text-xs text-gray-600 mt-1">Screenshot, Logo, or Brand Guide PDF.</p>
                  </div>
                  
                   <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/png, image/jpeg, image/webp, application/pdf" class="hidden">
                   
                   @if (!selectedFilePreview()) {
                     <button (click)="fileInput.click()" class="w-full neo-raised bg-gradient-to-br from-gray-100 to-gray-200 neo-hover text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group text-sm active:neo-inset">
                       <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" class="w-4 h-4 text-gray-500 group-hover:text-indigo-600 transition-colors">
                         <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                       </svg>
                       Select File
                     </button>
                   } @else {
                     <div class="flex items-center gap-3 neo-flat bg-gradient-to-br from-gray-100 to-gray-200 p-2 rounded-xl">
                        <div class="h-10 w-10 rounded-xl neo-inset bg-gray-100 overflow-hidden shrink-0">
                          @if (selectedFileIsImage()) {
                            <img [src]="selectedFilePreview()" class="h-full w-full object-cover">
                          } @else {
                            <div class="h-full w-full flex items-center justify-center text-gray-600 text-[10px] font-bold">PDF</div>
                          }
                        </div>
                        <div class="flex gap-2 flex-1">
                            <button (click)="analyzeFile()" [disabled]="isAnalyzing()" class="flex-1 neo-raised bg-gradient-to-br from-indigo-500 to-indigo-600 hover:neo-hover text-white font-medium text-xs px-3 py-2 rounded-xl transition-all disabled:opacity-50 active:neo-inset">
                                {{ isAnalyzing() && analyzeType() === 'file' ? 'Analyzing...' : 'Run Analysis' }}
                            </button>
                            <button (click)="clearFile()" class="p-2 neo-flat bg-gray-200 text-gray-500 hover:text-red-500 rounded-xl transition-colors">
                                <svg viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
                            </button>
                        </div>
                     </div>
                   }
              </div>
            </div>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 md:p-10 pt-0 space-y-8">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-3">
            <label class="text-sm font-bold text-gray-700 block tracking-wide">Brand Name</label>
            <input type="text" formControlName="brandName" class="w-full px-5 py-4 rounded-xl neo-inset bg-white focus:neo-flat outline-none transition-all placeholder:text-gray-400 font-medium text-gray-800">
          </div>

          <div class="space-y-3">
            <label class="text-sm font-bold text-gray-700 block tracking-wide">Industry</label>
            <div class="relative">
              <input type="text" formControlName="industry" list="industries" class="w-full px-5 py-4 rounded-xl neo-inset bg-white focus:neo-flat outline-none transition-all text-gray-800 font-medium">
              <datalist id="industries">
                <option value="Technology">
                <option value="Fashion">
                <option value="Food & Beverage">
                <option value="Health & Wellness">
                <option value="Finance">
                <option value="Travel">
                <option value="Real Estate">
              </datalist>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 p-6 neo-inset bg-gray-100 rounded-2xl">
           <div class="space-y-3">
            <label class="text-xs font-bold text-gray-600 uppercase tracking-widest block">Brand Colors</label>
            <div class="flex items-center gap-3">
                 <div class="w-12 h-12 rounded-2xl neo-flat bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0"></div>
                 <input type="text" formControlName="brandColors" placeholder="e.g. #FF5733, #333333" class="w-full px-4 py-3 rounded-xl neo-inset bg-white outline-none text-sm font-mono text-gray-700">
            </div>
           </div>
           <div class="space-y-3">
            <label class="text-xs font-bold text-gray-600 uppercase tracking-widest block">Visual Style</label>
            <input type="text" formControlName="brandStyle" placeholder="e.g. Minimalist, Luxury" class="w-full px-4 py-3 rounded-xl neo-inset bg-white outline-none text-sm text-gray-700">
           </div>
        </div>

        <div class="space-y-3">
          <label class="text-sm font-bold text-gray-700 block tracking-wide">Product / Service Description</label>
          <textarea formControlName="productDesc" rows="4" class="w-full px-5 py-4 rounded-xl neo-inset bg-white focus:neo-flat outline-none resize-none placeholder:text-gray-400 font-medium text-gray-800"></textarea>
        </div>

        <div class="space-y-3">
          <label class="text-sm font-bold text-gray-700 block tracking-wide">Target Audience</label>
          <input type="text" formControlName="targetAudience" class="w-full px-5 py-4 rounded-xl neo-inset bg-white focus:neo-flat outline-none transition-all placeholder:text-gray-400 font-medium text-gray-800">
        </div>

        <div class="pt-6">
          <button type="submit" [disabled]="form.invalid || isSubmitting()" class="w-full py-4.5 neo-raised bg-gradient-to-br from-indigo-500 to-indigo-600 hover:neo-hover text-white font-bold text-lg rounded-2xl transition-all disabled:opacity-50 hover:-translate-y-0.5 flex items-center justify-center gap-3 active:neo-inset">
            @if (isSubmitting()) {
              <svg class="animate-spin -ml-1 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating Strategy...</span>
            } @else {
              <span>{{ mode() === 'create' ? 'Create Project & Generate' : 'Save Changes' }}</span>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class SetupFormComponent implements OnInit {
  initialValues = input<ProjectParams | null>(null);
  mode = input<'create' | 'edit'>('create');
  submitForm = output<ProjectParams>();
  
  isSubmitting = signal(false);
  
  // File Analysis
  selectedFilePreview = signal<string | null>(null);
  selectedFileBase64: string | null = null;
  selectedFileMimeType: string = '';
  selectedFileIsImage = signal(true);
  
  // URL Analysis
  urlControl = new FormControl('', [Validators.pattern(/^https?:\/\/.+/)]);
  
  isAnalyzing = signal(false);
  analyzeType = signal<'file' | 'url' | null>(null);

  geminiService = inject(GeminiService);
  fb: FormBuilder = inject(FormBuilder);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      brandName: ['', Validators.required],
      industry: ['Technology', Validators.required],
      productDesc: ['', [Validators.required, Validators.minLength(10)]],
      targetAudience: ['', Validators.required],
      brandColors: [''],
      brandStyle: ['']
    });
  }

  ngOnInit() {
    if (this.initialValues()) {
      this.form.patchValue(this.initialValues()!);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFileMimeType = file.type;
      this.selectedFileIsImage.set(file.type.startsWith('image/'));
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.selectedFilePreview.set(result);
        this.selectedFileBase64 = result.split(',')[1];
      };
      reader.readAsDataURL(file);
    }
  }

  clearFile() {
    this.selectedFilePreview.set(null);
    this.selectedFileBase64 = null;
    this.selectedFileMimeType = '';
  }

  async analyzeFile() {
    if (!this.selectedFileBase64) return;
    this.runAnalysis('file', () => 
      this.geminiService.analyzeBrandAsset(this.selectedFileBase64!, this.selectedFileMimeType)
    );
  }

  async analyzeUrl() {
    if (this.urlControl.invalid || !this.urlControl.value) return;
    this.runAnalysis('url', () => 
      this.geminiService.analyzeWebsite(this.urlControl.value!)
    );
  }

  async runAnalysis(type: 'file' | 'url', analysisFn: () => Promise<any>) {
    this.isAnalyzing.set(true);
    this.analyzeType.set(type);
    
    try {
      const result = await analysisFn();
      this.form.patchValue({
        brandName: result.brandName || this.form.get('brandName')?.value,
        industry: result.industry || this.form.get('industry')?.value,
        productDesc: result.productDesc || this.form.get('productDesc')?.value,
        targetAudience: result.targetAudience || this.form.get('targetAudience')?.value,
        brandColors: result.brandColors || this.form.get('brandColors')?.value,
        brandStyle: result.brandStyle || this.form.get('brandStyle')?.value,
      });
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Please check the input and try again.');
    } finally {
      this.isAnalyzing.set(false);
      this.analyzeType.set(null);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      setTimeout(() => {
        this.submitForm.emit(this.form.value);
        this.isSubmitting.set(false);
      }, 500);
    }
  }
}