import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, SUPPORTED_LOCALES, SupportedLocale } from '../services/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button 
        (click)="isOpen = !isOpen"
        class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white backdrop-blur-sm border border-white/10"
      >
        <span class="text-lg">{{ i18n.currentLocaleConfig().flag }}</span>
        <span class="hidden md:inline text-sm font-medium">{{ i18n.currentLocaleConfig().nativeName }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      @if (isOpen) {
        <div class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-scale-in origin-top-right">
          @for (locale of locales; track locale.code) {
            <button
              (click)="selectLocale(locale.code)"
              class="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50 transition-colors text-left"
              [class.bg-indigo-100]="i18n.currentLocale() === locale.code"
            >
              <span class="text-2xl">{{ locale.flag }}</span>
              <div class="flex-1">
                <div class="text-sm font-semibold text-slate-900">{{ locale.nativeName }}</div>
                <div class="text-xs text-slate-500">{{ locale.name }}</div>
              </div>
              @if (i18n.currentLocale() === locale.code) {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-indigo-600">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              }
            </button>
          }
        </div>
      }
    </div>

    @if (isOpen) {
      <div 
        (click)="isOpen = false"
        class="fixed inset-0 z-40"
      ></div>
    }
  `,
  styles: [`
    @keyframes scale-in {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .animate-scale-in {
      animation: scale-in 0.2s ease-out;
    }
  `]
})
export class LanguageSwitcherComponent {
  i18n = inject(I18nService);
  locales = SUPPORTED_LOCALES;
  isOpen = false;

  selectLocale(code: SupportedLocale) {
    this.i18n.setLocale(code);
    this.isOpen = false;
  }
}
