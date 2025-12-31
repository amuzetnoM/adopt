import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'flex items-center justify-center ' + containerClass()">
      <div [class]="'animate-spin rounded-full border-solid ' + sizeClass() + ' ' + colorClass()">
      </div>
      @if (message()) {
        <p [class]="'mt-4 text-sm font-medium ' + textColorClass()">{{ message() }}</p>
      }
    </div>
  `,
  styles: [`
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class LoadingSpinnerComponent {
  size = input<'sm' | 'md' | 'lg'>('md');
  color = input<'primary' | 'white' | 'slate'>('primary');
  message = input<string>('');
  containerClass = input<string>('');

  sizeClass() {
    switch (this.size()) {
      case 'sm':
        return 'w-5 h-5 border-2';
      case 'lg':
        return 'w-16 h-16 border-4';
      default:
        return 'w-10 h-10 border-3';
    }
  }

  colorClass() {
    switch (this.color()) {
      case 'white':
        return 'border-white border-t-transparent';
      case 'slate':
        return 'border-slate-300 border-t-transparent';
      default:
        return 'border-indigo-500 border-t-transparent';
    }
  }

  textColorClass() {
    switch (this.color()) {
      case 'white':
        return 'text-white';
      case 'slate':
        return 'text-slate-600';
      default:
        return 'text-indigo-600';
    }
  }
}
