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
      [class]="'relative p-6 rounded-3xl transition-all duration-300 cursor-pointer group flex flex-col h-full ' + (concept().isSelected ? 'neo-inset bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700' : 'neo-raised bg-gradient-to-br from-gray-50 to-gray-100 neo-hover')"
    >
      <!-- Selection Indicator -->
      <div [class]="'absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-all ' + (concept().isSelected ? 'neo-flat bg-gradient-to-br from-indigo-500 to-indigo-600 text-white' : 'neo-inset bg-gray-200 text-gray-400 group-hover:bg-indigo-50')">
        @if (concept().isSelected) {
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-9a.75.75 0 011.06-1.06l5.353 8.03 8.493-12.739a.75.75 0 011.04-.208z" clip-rule="evenodd" />
          </svg>
        }
      </div>

      <div class="mb-4">
        <span class="text-[10px] font-bold uppercase tracking-widest neo-flat px-3 py-1.5 rounded-xl inline-block" [class]="concept().isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-700'">
          {{ concept().angle }}
        </span>
      </div>

      <h3 class="text-lg font-bold mb-2 leading-snug" [class]="concept().isSelected ? 'text-indigo-900' : 'text-gray-800'">{{ concept().headline }}</h3>
      <p class="text-sm mb-6 flex-grow" [class]="concept().isSelected ? 'text-indigo-700' : 'text-gray-600'">{{ concept().hook }}</p>

      <!-- Blueprint / Specs Area -->
      <div class="neo-inset rounded-2xl p-4 text-xs space-y-3 font-mono" [class]="concept().isSelected ? 'bg-indigo-50/50' : 'bg-gray-100'">
        <div class="flex items-start gap-2">
          <span class="font-bold uppercase w-16 shrink-0" [class]="concept().isSelected ? 'text-indigo-500' : 'text-gray-500'">Visual:</span>
          <span class="leading-relaxed" [class]="concept().isSelected ? 'text-indigo-800' : 'text-gray-700'">{{ concept().visualDirection }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold uppercase w-16 shrink-0" [class]="concept().isSelected ? 'text-indigo-500' : 'text-gray-500'">Mood:</span>
          <span class="font-semibold" [class]="concept().isSelected ? 'text-indigo-900' : 'text-gray-800'">{{ concept().mood }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold uppercase w-16 shrink-0" [class]="concept().isSelected ? 'text-indigo-500' : 'text-gray-500'">Type:</span>
          <span [class]="concept().isSelected ? 'text-indigo-900' : 'text-gray-800'">{{ concept().typography }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-bold uppercase w-16 shrink-0" [class]="concept().isSelected ? 'text-indigo-500' : 'text-gray-500'">Color:</span>
          <span [class]="concept().isSelected ? 'text-indigo-900' : 'text-gray-800'">{{ concept().colorPaletteSuggestion }}</span>
        </div>
      </div>
    </div>
  `
})
export class IdeationCardComponent {
  concept = input.required<IdeationConcept>();
  toggle = output<void>();
}