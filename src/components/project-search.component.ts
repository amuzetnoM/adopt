import { Component, inject, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService, Project } from '../services/storage.service';
import { I18nService } from '../services/i18n.service';

@Component({
  selector: 'app-project-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 space-y-4">
      <!-- Search Bar -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-slate-400">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <input
          [(ngModel)]="searchQuery"
          type="text"
          [placeholder]="i18n.t('common.search') + ' campaigns...'"
          class="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
        />
        @if (searchQuery()) {
          <button
            (click)="searchQuery.set('')"
            class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        }
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2">
        <div class="flex-1 min-w-[200px]">
          <select
            [(ngModel)]="statusFilter"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="ideation">Ideation</option>
            <option value="production">Production</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div class="flex-1 min-w-[200px]">
          <select
            [(ngModel)]="sortBy"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-sm"
          >
            <option value="modified">Recently Modified</option>
            <option value="created">Recently Created</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        @if (hasActiveFilters()) {
          <button
            (click)="clearFilters()"
            class="px-4 py-2 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Clear Filters
          </button>
        }
      </div>

      <!-- Results Count -->
      @if (filteredProjects().length !== totalProjects()) {
        <div class="text-sm text-slate-600">
          Showing {{ filteredProjects().length }} of {{ totalProjects() }} campaigns
        </div>
      }
    </div>
  `
})
export class ProjectSearchComponent {
  storage = inject(StorageService);
  i18n = inject(I18nService);

  onFilterChange = output<Project[]>();

  searchQuery = signal('');
  statusFilter = signal<string>('all');
  sortBy = signal<'modified' | 'created' | 'name'>('modified');

  totalProjects = computed(() => this.storage.projects().length);

  filteredProjects = computed(() => {
    let projects = [...this.storage.projects()];

    // Apply search
    const query = this.searchQuery().toLowerCase();
    if (query) {
      projects = projects.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.params.brandName.toLowerCase().includes(query) ||
        p.params.industry.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (this.statusFilter() !== 'all') {
      projects = projects.filter(p => p.status === this.statusFilter());
    }

    // Apply sorting
    switch (this.sortBy()) {
      case 'modified':
        projects.sort((a, b) => b.lastModified - a.lastModified);
        break;
      case 'created':
        projects.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'name':
        projects.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return projects;
  });

  constructor() {
    // Emit changes when filtered projects change
    effect(() => {
      this.onFilterChange.emit(this.filteredProjects());
    });
  }

  hasActiveFilters = computed(() => 
    this.searchQuery() !== '' || this.statusFilter() !== 'all'
  );

  clearFilters() {
    this.searchQuery.set('');
    this.statusFilter.set('all');
  }
}
