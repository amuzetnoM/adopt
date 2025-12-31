import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorHandlerService, AppError } from '../services/error-handler.service';

@Component({
  selector: 'app-toast-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      @for (error of errorHandler.errors(); track error.id) {
        <div 
          class="pointer-events-auto bg-white rounded-2xl shadow-2xl border p-4 flex items-start gap-3 animate-slide-in-right"
          [class.border-red-200]="error.type === 'error'"
          [class.border-emerald-200]="error.type === 'success'"
          [class.border-amber-200]="error.type === 'warning'"
          [class.border-blue-200]="error.type === 'info'"
        >
          <!-- Icon -->
          <div 
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            [class.bg-red-100]="error.type === 'error'"
            [class.bg-emerald-100]="error.type === 'success'"
            [class.bg-amber-100]="error.type === 'warning'"
            [class.bg-blue-100]="error.type === 'info'"
          >
            @if (error.type === 'error') {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-red-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            }
            @if (error.type === 'success') {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-emerald-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            @if (error.type === 'warning') {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-amber-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            }
            @if (error.type === 'info') {
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-blue-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            }
          </div>

          <!-- Message -->
          <div class="flex-1 pt-1">
            <p 
              class="text-sm font-medium leading-relaxed"
              [class.text-red-800]="error.type === 'error'"
              [class.text-emerald-800]="error.type === 'success'"
              [class.text-amber-800]="error.type === 'warning'"
              [class.text-blue-800]="error.type === 'info'"
            >
              {{ error.message }}
            </p>
          </div>

          <!-- Dismiss Button -->
          @if (error.dismissible) {
            <button 
              (click)="errorHandler.dismiss(error.id)"
              class="shrink-0 p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in-right {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in-right {
      animation: slide-in-right 0.3s ease-out;
    }
  `]
})
export class ToastNotificationsComponent {
  errorHandler = inject(ErrorHandlerService);
}
