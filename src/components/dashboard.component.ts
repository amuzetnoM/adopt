import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService, Project } from '../services/storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <!-- Dashboard Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Campaigns</h1>
          <p class="text-slate-500 mt-2 text-lg">Manage your advertising concepts and strategies.</p>
        </div>
        
        <button (click)="onCreate.emit()" class="md:hidden w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          New Campaign
        </button>
      </div>

      <!-- Responsive Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        <!-- Create New Card (Desktop) -->
        <div (click)="onCreate.emit()" class="hidden md:flex group cursor-pointer min-h-[280px] rounded-3xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/30 transition-all duration-300 flex-col items-center justify-center text-center p-8 active:scale-95">
            <div class="w-20 h-20 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:border-indigo-100 transition-all duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-10 h-10 text-indigo-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">Create Campaign</h3>
            <p class="text-slate-500 text-sm mt-2 max-w-[200px]">Start a new strategy with automated insights.</p>
        </div>

        @for (project of storage.projects(); track project.id) {
            <div (click)="onSelect.emit(project.id)" class="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden relative animate-fade-in-up" [style.animation-delay]="$index * 50 + 'ms'">
              
              <!-- Decoration -->
              <div class="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 left-0"></div>

              <div class="p-7 flex-1 flex flex-col">
                <div class="flex items-start justify-between mb-6">
                  <div class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl font-bold text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shadow-inner">
                     {{ project.params.brandName.charAt(0).toUpperCase() }}
                  </div>
                  
                  <button (click)="onDelete($event, project.id)" class="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
                
                <h3 class="font-bold text-slate-900 text-xl mb-1 truncate tracking-tight">{{ project.name }}</h3>
                <p class="text-sm text-slate-500 font-medium">{{ project.params.industry }}</p>
                
                <div class="mt-auto pt-8">
                   <div class="flex items-center justify-between text-xs mb-2">
                      <span class="text-slate-400 font-semibold uppercase tracking-wider">Progress</span>
                      <span class="text-slate-600 font-bold">
                        @if(project.status === 'completed') { Ready } 
                        @else if (project.status === 'ideation') { Concepts }
                        @else { {{ project.status }} }
                      </span>
                   </div>
                   <!-- Progress Bar -->
                   <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500" 
                           [class]="project.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-500'"
                           [style.width]="project.status === 'completed' ? '100%' : (project.status === 'production' ? '75%' : (project.status === 'ideation' ? '40%' : '10%'))">
                      </div>
                   </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-7 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                 <span>{{ project.lastModified | date:'MMM d, y' }}</span>
                 <div [class]="getStatusClass(project.status) + ' flex items-center gap-1.5 px-2.5 py-1 rounded-full uppercase text-[10px] tracking-wider font-bold'">
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'production': return 'bg-amber-100 text-amber-700';
      case 'generating': return 'bg-indigo-100 text-indigo-700 animate-pulse';
      default: return 'bg-slate-200 text-slate-600';
    }
  }

  onDelete(event: Event, id: string) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      this.storage.deleteProject(id);
    }
  }
}
