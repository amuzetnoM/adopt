import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdeationConcept } from '../services/storage.service';

@Component({
  selector: 'app-ideation-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      (click)="toggle.emit()"
      [class]="'relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer group flex flex-col h-full ' + (concept().isSelected ? 'bg-indigo-50 border-indigo-500 shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md')"
    >
      <!-- Selection Indicator -->
      <div [class]="'absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ' + (concept().isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white group-hover:border-indigo-400')">
        @if (concept().isSelected) {
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 text-white">
            <path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-9a.75.75 0 011.06-1.06l5.353 8.03 8.493-12.739a.75.75 0 011.04-.208z" clip-rule="evenodd" />
          </svg>
        }
      </div>

      <div class="mb-4">
        <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
          {{ concept().angle }}
        </span>
      </div>

      <h3 class="text-lg font-bold text-slate-900 mb-2 leading-snug">{{ concept().headline }}</h3>
      <p class="text-sm text-slate-600 mb-6 flex-grow">{{ concept().hook }}</p>

      <!-- Blueprint / Specs Area -->
      <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs space-y-3 font-mono text-slate-600">
        <div class="flex items-start gap-2">
          <span class="font-bold text-slate-400 uppercase w-16 shrink-0">Visual:</span>
          <span class="leading-relaxed">{{ concept().visualDirection }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-400 uppercase w-16 shrink-0">Mood:</span>
          <span class="text-slate-800 font-semibold">{{ concept().mood }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-400 uppercase w-16 shrink-0">Type:</span>
          <span class="text-slate-800">{{ concept().typography }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-400 uppercase w-16 shrink-0">Color:</span>
          <span class="text-slate-800">{{ concept().colorPaletteSuggestion }}</span>
        </div>
      </div>
    </div>
  `
})
export class IdeationCardComponent {
  concept = input.required<IdeationConcept>();
  toggle = output<void>();
}