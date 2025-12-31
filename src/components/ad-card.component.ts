import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinalAd } from '../services/storage.service';

@Component({
  selector: 'app-ad-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-full flex flex-col bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group hover:-translate-y-1 relative">
      
      <!-- Top Right Actions Menu -->
      <div class="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
        <button (click)="onDelete.emit()" class="bg-white/90 backdrop-blur text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full border border-slate-200 shadow-sm transition-colors" title="Delete Ad">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      <!-- Image Area -->
      <div class="relative aspect-[3/4] bg-slate-100 w-full overflow-hidden">
        @if (ad().imageUrl) {
          <img [src]="ad().imageUrl" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Generated Ad Visual">
          
          <!-- Platform Badge with Icon -->
          <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-md pl-2 pr-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-2 z-10 border border-slate-100">
             <div class="w-5 h-5 flex items-center justify-center">
                @switch (ad().platform) {
                  @case ('facebook') {
                    <svg class="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  }
                  @case ('instagram') {
                    <svg class="w-5 h-5 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  }
                  @case ('linkedin') {
                    <svg class="w-5 h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  }
                  @case ('twitter') {
                     <svg class="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  }
                  @default {
                     <svg class="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                  }
                }
             </div>
             <span class="uppercase tracking-wide text-slate-700">{{ ad().platform }}</span>
          </div>

          <!-- A/B Variant Badge -->
          @if (ad().variantName) {
            <div class="absolute top-4 left-32 bg-indigo-600/90 text-white backdrop-blur-md px-2 py-1.5 rounded-lg text-xs font-bold shadow-sm z-10 border border-indigo-500">
              {{ ad().variantName }}
            </div>
          }
          
          <!-- SEO SCORE BADGE -->
          @if (ad().seo) {
            <div class="absolute top-4 right-14 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 z-10 border border-slate-100">
               <span class="text-slate-400">SEO</span>
               <div [class]="'flex items-center gap-1 ' + (ad().seo!.score >= 80 ? 'text-green-600' : 'text-amber-500')">
                 <span class="text-sm">{{ ad().seo!.score }}</span>
                 <svg *ngIf="ad().seo!.score >= 80" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
               </div>
            </div>
          }

          <!-- Actions Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 z-20">
            <div class="flex items-center justify-between translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
               <span class="text-white/80 text-xs font-medium backdrop-blur-sm bg-white/10 px-3 py-1 rounded-full border border-white/20">Imagen 4.0</span>
               <button (click)="downloadImage(ad().imageUrl!)" class="bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-indigo-600 p-2.5 rounded-full transition-colors border border-white/30">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 12.75l-3-3m0 0l3-3m0 3h7.5" transform="rotate(270 12 12)"/>
                  </svg>
               </button>
            </div>
          </div>
        } @else if (ad().isLoadingImage) {
          <div class="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 space-y-4">
             <div class="relative w-16 h-16">
               <div class="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
               <div class="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
             </div>
             <span class="text-sm font-semibold text-indigo-600 animate-pulse tracking-wide">Rendering Pixels...</span>
          </div>
        } @else {
          <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center bg-slate-50/50">
            <div class="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 opacity-50">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <button (click)="onGenerateImage.emit()" class="text-indigo-600 text-sm font-bold hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors">
              Generate Visual
            </button>
          </div>
        }
      </div>

      <!-- Content Area -->
      <div class="flex-1 p-6 flex flex-col bg-white relative z-10">
        
        <!-- Toggle Content / SEO -->
        <div class="flex justify-center mb-4 bg-slate-100 p-1 rounded-lg">
          <button (click)="activeTab.set('content')" [class]="'flex-1 py-1 text-xs font-bold rounded-md transition-all ' + (activeTab() === 'content' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')">Preview</button>
          <button (click)="activeTab.set('seo')" [class]="'flex-1 py-1 text-xs font-bold rounded-md transition-all ' + (activeTab() === 'seo' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')">SEO Metadata</button>
        </div>

        @if (activeTab() === 'content') {
          <div class="mb-4 animate-fade-in">
            <div class="flex items-start justify-between gap-4 mb-2">
               <h3 class="text-lg font-bold text-slate-900 leading-snug line-clamp-2">{{ ad().headline }}</h3>
               <button (click)="copyToClipboard(ad().headline + '\\n\\n' + ad().body)" class="text-slate-300 hover:text-indigo-600 transition-colors shrink-0" title="Copy Text">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg>
              </button>
            </div>
            <p class="text-slate-600 text-sm leading-relaxed font-medium line-clamp-4">{{ ad().body }}</p>
          </div>
        } @else {
          <!-- SEO View -->
          <div class="mb-4 animate-fade-in space-y-3 overflow-y-auto max-h-[140px] custom-scrollbar pr-2">
            @if (ad().seo; as seo) {
               <div>
                 <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Keywords</span>
                 <div class="flex flex-wrap gap-1">
                   @for (kw of seo.keywords; track kw) {
                     <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200">{{ kw }}</span>
                   }
                 </div>
               </div>

               <div>
                 <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Hashtags</span>
                 <div class="flex flex-wrap gap-1">
                   @for (tag of seo.hashtags; track tag) {
                     <span class="text-indigo-500 text-[10px] font-medium">#{{ tag.replace('#','') }}</span>
                   }
                 </div>
               </div>

               <div>
                 <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Meta Description</span>
                 <p class="text-xs text-slate-600 leading-relaxed italic bg-amber-50 p-2 rounded border border-amber-100">{{ seo.metaDescription }}</p>
               </div>
            } @else {
               <div class="text-center py-6 text-slate-400 text-xs">No SEO data available.</div>
            }
          </div>
        }

        <div class="mt-auto pt-4 border-t border-slate-50">
           <div class="flex items-center justify-between mb-4">
             <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">CTA</span>
             <span class="text-xs font-bold text-white bg-slate-900 px-3 py-1 rounded-full">{{ ad().callToAction }}</span>
           </div>
           
           @if (ad().scheduledTime) {
             <div class="group/schedule relative">
               <button (click)="isScheduling.set(true)" class="w-full py-2.5 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 flex items-center justify-center gap-2 text-sm font-semibold shadow-sm transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ ad().scheduledTime | date:'MMM d, h:mm a' }}</span>
               </button>
               
               <!-- Unschedule Button (Visible on hover) -->
               <button (click)="onUnschedule.emit()" class="absolute -top-2 -right-2 bg-red-100 hover:bg-red-500 hover:text-white text-red-600 p-1 rounded-full shadow-md opacity-0 group-hover/schedule:opacity-100 transition-all z-20" title="Unschedule">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                   <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                 </svg>
               </button>
             </div>
             
             <!-- Re-schedule Modal if clicked -->
             @if(isScheduling()) {
               <div class="mt-2 bg-white border border-indigo-100 p-2 rounded-xl shadow-lg absolute bottom-0 left-0 w-full z-30 animate-fade-in-up">
                  <label class="text-xs font-bold text-indigo-800 mb-1 block">Edit Schedule</label>
                  <input 
                    type="datetime-local" 
                    [(ngModel)]="scheduleDate"
                    class="w-full px-2 py-1.5 rounded-lg border border-indigo-200 text-xs mb-2 focus:outline-none focus:border-indigo-500 text-slate-700"
                  >
                  <div class="flex gap-2">
                     <button (click)="confirmSchedule()" class="flex-1 bg-indigo-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-indigo-700">Update</button>
                     <button (click)="isScheduling.set(false)" class="flex-1 bg-white text-slate-500 text-xs font-bold py-1.5 rounded-lg hover:bg-slate-50 border border-slate-100">Cancel</button>
                  </div>
               </div>
             }
             
           } @else {
             
             @if (!isScheduling()) {
               <button (click)="isScheduling.set(true)" class="w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all font-semibold text-sm flex items-center justify-center gap-2 group">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Schedule Post
               </button>
             } @else {
               <div class="bg-indigo-50 p-2 rounded-xl animate-fade-in-up">
                  <label class="text-xs font-bold text-indigo-800 mb-1 block">Pick Date & Time</label>
                  <input 
                    type="datetime-local" 
                    [(ngModel)]="scheduleDate"
                    class="w-full px-2 py-1.5 rounded-lg border border-indigo-200 text-xs mb-2 focus:outline-none focus:border-indigo-500 text-slate-700"
                  >
                  <div class="flex gap-2">
                     <button (click)="confirmSchedule()" class="flex-1 bg-indigo-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-indigo-700">Confirm</button>
                     <button (click)="isScheduling.set(false)" class="flex-1 bg-white text-slate-500 text-xs font-bold py-1.5 rounded-lg hover:bg-slate-50">Cancel</button>
                  </div>
               </div>
             }
           }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
    
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.2s ease-out forwards;
    }
    
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  `]
})
export class AdCardComponent {
  ad = input.required<FinalAd>();
  onGenerateImage = output<void>();
  onSchedule = output<number>(); // Emits timestamp
  onUnschedule = output<void>();
  onDelete = output<void>();

  isScheduling = signal(false);
  scheduleDate = signal('');
  
  activeTab = signal<'content' | 'seo'>('content');

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  downloadImage(url: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = `adscale-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  confirmSchedule() {
    if (this.scheduleDate()) {
      const timestamp = new Date(this.scheduleDate()).getTime();
      this.onSchedule.emit(timestamp);
      this.isScheduling.set(false);
    }
  }
}