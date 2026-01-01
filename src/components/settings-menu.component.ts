import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataBackupService } from '../services/data-backup.service';
import { I18nService } from '../services/i18n.service';
import { ThemeService } from '../services/theme.service';
import { ErrorHandlerService } from '../services/error-handler.service';

@Component({
  selector: 'app-settings-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <button
        (click)="isOpen.set(!isOpen())"
        class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 text-white backdrop-blur-sm border border-white/10"
        title="Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      @if (isOpen()) {
        <div class="absolute left-0 bottom-full mb-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 py-2 z-50 animate-scale-in origin-bottom-left">

          <!-- Appearance Section -->
          <div class="px-4 py-3 border-b border-slate-100 dark:border-gray-700">
            <h3 class="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">Appearance</h3>
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 text-slate-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              <input
                type="range"
                min="0"
                max="100"
                [ngModel]="theme.darkness()"
                (ngModelChange)="theme.setDarkness($event)"
                class="flex-1 h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
              <svg class="w-4 h-4 text-slate-600 dark:text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div class="flex justify-between mt-1 text-[10px] text-slate-400 dark:text-gray-500 font-medium">
              <span>Light</span>
              <span>Dark</span>
            </div>
          </div>

          <div class="px-4 py-3 border-b border-slate-100 dark:border-gray-700">
            <h3 class="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">Data Management</h3>
          </div>

          <div class="py-2">
            <button
              (click)="handleExport()"
              class="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-indigo-600 dark:text-indigo-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <div class="flex-1">
                <div class="font-semibold text-slate-900 dark:text-gray-100">Export Data</div>
                <div class="text-xs text-slate-500 dark:text-gray-400">Download backup file</div>
              </div>
            </button>

            <button
              (click)="handleImport()"
              class="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-left text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-indigo-600 dark:text-indigo-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <div class="flex-1">
                <div class="font-semibold text-slate-900 dark:text-gray-100">Import Data</div>
                <div class="text-xs text-slate-500 dark:text-gray-400">Restore from backup</div>
              </div>
            </button>

            @if (lastBackup()) {
              <button
                (click)="handleRestoreAutoBackup()"
                class="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-left text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-amber-600 dark:text-amber-400">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                <div class="flex-1">
                  <div class="font-semibold text-slate-900 dark:text-gray-100">Restore Auto-Backup</div>
                  <div class="text-xs text-slate-500 dark:text-gray-400">From {{ i18n.formatDate(lastBackup()!, { dateStyle: 'short', timeStyle: 'short' }) }}</div>
                </div>
              </button>
            }
          </div>

          <div class="border-t border-slate-100 dark:border-gray-700 py-2">
            <button
              (click)="handleClearAll()"
              class="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-red-600 dark:text-red-400">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              <div class="flex-1">
                <div class="font-semibold text-red-600 dark:text-red-400">Clear All Data</div>
                <div class="text-xs text-red-500 dark:text-red-500">Permanent deletion</div>
              </div>
            </button>
          </div>
        </div>
      }

      <input
        #fileInput
        type="file"
        accept=".json"
        (change)="onFileSelected($event)"
        class="hidden"
      />
    </div>

    @if (isOpen()) {
      <div
        (click)="isOpen.set(false)"
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
export class SettingsMenuComponent {
  backup = inject(DataBackupService);
  i18n = inject(I18nService);
  errorHandler = inject(ErrorHandlerService);
  theme = inject(ThemeService);

  isOpen = signal(false);
  lastBackup = signal<Date | null>(null);

  constructor() {
    this.lastBackup.set(this.backup.getLastBackupDate());
  }

  handleExport() {
    this.backup.exportData();
    this.isOpen.set(false);
  }

  handleImport() {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    input?.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      await this.backup.importData(file);
      this.isOpen.set(false);
    }

    // Reset input
    input.value = '';
  }

  handleRestoreAutoBackup() {
    this.backup.restoreAutoBackup();
    this.isOpen.set(false);
  }

  handleClearAll() {
    this.backup.clearAllData();
    this.isOpen.set(false);
  }
}
