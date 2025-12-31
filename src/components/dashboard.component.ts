import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService, Project } from '../services/storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8 md:p-12 max-w-[1600px] mx-auto">
      <div class="flex items-end justify-between mb-10">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Campaigns</h1>
          <p class="text-slate-500 mt-2 text-lg">Manage your AI-generated advertising concepts and assets.</p>
        </div>
        
        <!-- Filter/Search could go here -->
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        <!-- Create New Card -->
        <div (click)="onCreate.emit()" class="group cursor-pointer min-h-[280px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 transition-all duration-300 flex flex-col items-center justify-center text-center p-8">
            <div class="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8 text-indigo-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Create Campaign</h3>
            <p class="text-slate-500 text-sm mt-2 max-w-[200px]">Start a new strategy with AI-powered insights.</p>
        </div>

        @for (project of storage.projects(); track project.id) {
            <div (click)="onSelect.emit(project.id)" class="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden relative">
              
              <!-- Decoration Gradient -->
              <div class="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 left-0"></div>

              <div class="p-6 flex-1 flex flex-col">
                <div class="flex items-start justify-between mb-6">
                  <div class="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                     {{ project.params.brandName.charAt(0).toUpperCase() }}
                  </div>
                  <button (click)="$event.stopPropagation(); onDelete(project.id)" class="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
                
                <h3 class="font-bold text-slate-900 text-lg mb-1 truncate tracking-tight">{{ project.name }}</h3>
                <p class="text-sm text-slate-500 font-medium">{{ project.params.industry }}</p>
                
                <div class="mt-auto pt-6">
                   <div class="flex items-center justify-between text-xs mb-2">
                      <span class="text-slate-400 font-medium">Progress</span>
                      <span class="text-slate-600 font-semibold">{{ project.concepts.length }} Concepts</span>
                   </div>
                   <!-- Fake Progress Bar -->
                   <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full bg-indigo-500 rounded-full" [style.width]="project.status === 'completed' ? '100%' : (project.status === 'generating' ? '50%' : '10%')"></div>
                   </div>
                </div>
              </div>

              <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                 <span>{{ project.lastModified | date:'MMM d, y' }}</span>
                 <span [class]="getStatusClass(project.status) + ' px-2.5 py-1 rounded-full uppercase text-[10px] tracking-wider font-bold'">
                   {{ project.status }}
                 </span>
              </div>
            </div>
          }
      </div>
    </div>
  `
})
export class DashboardComponent {
  storage = inject(StorageService);
  onCreate = output<void>();
  onSelect = output<string>();

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'generating': return 'bg-indigo-100 text-indigo-700 animate-pulse';
      default: return 'bg-slate-200 text-slate-600';
    }
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.storage.deleteProject(id);
    }
  }
}