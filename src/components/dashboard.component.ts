import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService, Project } from '../services/storage.service';
import { ProjectSearchComponent } from './project-search.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProjectSearchComponent],
  template: `
    <div class="w-full">
      <!-- Dashboard Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 class="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">Campaigns</h1>
          <p class="text-gray-600 mt-2 text-lg">Manage your advertising concepts and strategies.</p>
        </div>
        
        <button (click)="onCreate.emit()" class="md:hidden w-full neo-raised bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:neo-inset transition-all neo-hover">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Campaign
        </button>
      </div>

      <!-- Search and Filter -->
      <app-project-search (onFilterChange)="filteredProjects.set($event)"></app-project-search>

      <!-- Responsive Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        <!-- Create New Card (Desktop) -->
        <div (click)="onCreate.emit()" class="hidden md:flex group cursor-pointer min-h-[280px] rounded-3xl neo-raised bg-gradient-to-br from-gray-100 to-gray-200 neo-hover transition-all duration-300 flex-col items-center justify-center text-center p-8 active:neo-inset">
            <div class="w-20 h-20 rounded-2xl neo-flat bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                <svg class="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">Create Campaign</h3>
            <p class="text-gray-600 text-sm mt-2 max-w-[200px]">Start a new strategy with automated insights.</p>
        </div>

        @for (project of displayProjects(); track project.id) {
            <div (click)="onSelect.emit(project.id)" class="group neo-raised bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl neo-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden relative animate-fade-in-up" [style.animation-delay]="$index * 50 + 'ms'">
              
              <div class="p-7 flex-1 flex flex-col">
                <div class="flex items-start justify-between mb-6">
                  <div class="w-14 h-14 rounded-2xl neo-flat bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl font-bold text-indigo-600 group-hover:text-indigo-700 transition-colors">
                     {{ project.params.brandName.charAt(0).toUpperCase() }}
                  </div>
                  
                  <button (click)="onDelete($event, project.id)" class="text-gray-400 hover:text-red-500 transition-all p-2 rounded-xl neo-flat hover:neo-inset z-20 relative" title="Delete Project">
                    <svg viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 pointer-events-none">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
                
                <h3 class="font-bold text-gray-800 text-xl mb-1 truncate tracking-tight">{{ project.name }}</h3>
                <p class="text-sm text-gray-600 font-medium">{{ project.params.industry }}</p>
                
                <div class="mt-auto pt-8">
                   <div class="flex items-center justify-between text-xs mb-2">
                      <span class="text-gray-500 font-semibold uppercase tracking-wider">Progress</span>
                      <span class="text-gray-700 font-bold">
                        @if(project.status === 'completed') { Ready } 
                        @else if (project.status === 'ideation') { Concepts }
                        @else { {{ project.status }} }
                      </span>
                   </div>
                   <!-- Progress Bar -->
                   <div class="h-2.5 w-full rounded-full neo-inset overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500 neo-flat" 
                           [class]="project.status === 'completed' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-indigo-400 to-indigo-600'"
                           [style.width]="project.status === 'completed' ? '100%' : (project.status === 'production' ? '75%' : (project.status === 'ideation' ? '40%' : '10%'))">
                      </div>
                   </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-7 py-4 bg-gradient-to-b from-transparent to-gray-200/50 flex items-center justify-between text-xs font-medium text-gray-600">
                 <span>{{ project.lastModified | date:'MMM d, y' }}</span>
                 <div [class]="getStatusClass(project.status) + ' flex items-center gap-1.5 px-2.5 py-1 rounded-full uppercase text-[10px] tracking-wider font-bold neo-flat'">
                   <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                   {{ project.status }}
                 </div>
              </div>
            </div>
          }
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  `]
})
export class DashboardComponent {
  storage = inject(StorageService);
  onCreate = output<void>();
  onSelect = output<string>();

  filteredProjects = signal<Project[] | null>(null);

  displayProjects() {
    // If filter has been applied, use filtered results (even if empty)
    // Otherwise use all projects
    return this.filteredProjects() !== null ? this.filteredProjects()! : this.storage.projects();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-50 text-emerald-700';
      case 'production': return 'bg-amber-50 text-amber-700';
      case 'generating': return 'bg-indigo-50 text-indigo-700 animate-pulse';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  onDelete(event: Event, id: string) {
    // Crucial: Stop all propagation to prevent opening the project card
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      this.storage.deleteProject(id);
    }
  }
}
