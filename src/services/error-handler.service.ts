import { Injectable, inject, signal } from '@angular/core';
import { I18nService } from './i18n.service';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: number;
  dismissible: boolean;
  autoHide?: number; // milliseconds
}

// UUID fallback for browsers without crypto.randomUUID
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private i18n = inject(I18nService);
  
  errors = signal<AppError[]>([]);

  showError(message: string, autoHide: number = 5000) {
    this.addError({
      id: generateUUID(),
      message,
      type: 'error',
      timestamp: Date.now(),
      dismissible: true,
      autoHide
    });
  }

  showSuccess(message: string, autoHide: number = 3000) {
    this.addError({
      id: generateUUID(),
      message,
      type: 'success',
      timestamp: Date.now(),
      dismissible: true,
      autoHide
    });
  }

  showWarning(message: string, autoHide: number = 4000) {
    this.addError({
      id: generateUUID(),
      message,
      type: 'warning',
      timestamp: Date.now(),
      dismissible: true,
      autoHide
    });
  }

  showInfo(message: string, autoHide: number = 3000) {
    this.addError({
      id: generateUUID(),
      message,
      type: 'info',
      timestamp: Date.now(),
      dismissible: true,
      autoHide
    });
  }

  private addError(error: AppError) {
    this.errors.update(list => [...list, error]);
    
    if (error.autoHide) {
      setTimeout(() => {
        this.dismiss(error.id);
      }, error.autoHide);
    }
  }

  dismiss(id: string) {
    this.errors.update(list => list.filter(e => e.id !== id));
  }

  dismissAll() {
    this.errors.set([]);
  }

  // Helper to handle API errors with retry logic
  async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          this.showWarning(`Retrying... (${i + 1}/${maxRetries})`, 2000);
          await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
        }
      }
    }
    
    this.showError(this.formatError(lastError));
    throw lastError;
  }

  private formatError(error: any): string {
    if (typeof error === 'string') return error;
    
    // Handle specific error types
    if (error?.message?.includes('quota')) {
      return this.i18n.t('errors.quota_exceeded');
    }
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return this.i18n.t('errors.network');
    }
    if (error?.status === 401 || error?.status === 403) {
      return this.i18n.t('errors.unauthorized');
    }
    if (error?.status === 404) {
      return this.i18n.t('errors.not_found');
    }
    
    return error?.message || this.i18n.t('errors.generic');
  }
}
