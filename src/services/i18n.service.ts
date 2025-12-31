import { Injectable, signal, computed } from '@angular/core';

export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'pt' | 'it';

export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', rtl: false },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', rtl: false },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', rtl: false }
];

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly STORAGE_KEY = 'adscale_locale';
  
  currentLocale = signal<SupportedLocale>('en');
  
  currentLocaleConfig = computed(() => 
    SUPPORTED_LOCALES.find(l => l.code === this.currentLocale()) || SUPPORTED_LOCALES[0]
  );

  private translations = signal<Record<string, any>>({});

  constructor() {
    this.loadLocale();
  }

  private loadLocale() {
    const saved = localStorage.getItem(this.STORAGE_KEY) as SupportedLocale;
    if (saved && SUPPORTED_LOCALES.some(l => l.code === saved)) {
      this.setLocale(saved);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0] as SupportedLocale;
      if (SUPPORTED_LOCALES.some(l => l.code === browserLang)) {
        this.setLocale(browserLang);
      }
    }
  }

  async setLocale(locale: SupportedLocale) {
    this.currentLocale.set(locale);
    localStorage.setItem(this.STORAGE_KEY, locale);
    
    // Load translations dynamically
    try {
      const module = await import(`../i18n/${locale}.json`);
      this.translations.set(module.default || module);
    } catch (e) {
      console.warn(`Failed to load translations for ${locale}`, e);
    }
  }

  t(key: string, params?: Record<string, string | number>): string {
    const trans = this.translations();
    let value = key.split('.').reduce((obj: any, k) => obj?.[k], trans) || key;
    
    // Replace parameters
    if (params && typeof value === 'string') {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }
    
    return value;
  }

  // Helper for plural forms
  plural(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural;
  }

  // Format date according to locale
  formatDate(date: Date | number, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'number' ? new Date(date) : date;
    return new Intl.DateTimeFormat(this.currentLocale(), options).format(d);
  }

  // Format number according to locale
  formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.currentLocale(), options).format(num);
  }
}
