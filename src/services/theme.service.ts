import { Injectable, signal, computed, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    // 0 = Light, 100 = Dark
    darkness = signal<number>(0);

    // Derived state
    isDark = computed(() => this.darkness() > 50);

    constructor() {
        // Load from storage
        const stored = localStorage.getItem('theme_darkness');
        if (stored) {
            this.darkness.set(Number(stored));
        } else {
            // Check system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.darkness.set(85); // Default dark
            }
        }

        // Effect to apply changes
        effect(() => {
            const val = this.darkness();
            const isDark = this.isDark();

            // Save
            localStorage.setItem('theme_darkness', val.toString());

            // Update Root Class for Tailwind Dark Mode
            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            // Update CSS Variables for fine-grained control
            document.documentElement.style.setProperty('--darkness', val.toString());
            document.documentElement.style.setProperty('--glass-opacity', (0.8 - (val / 150)).toString());
        });
    }

    setDarkness(val: number) {
        this.darkness.set(Math.min(100, Math.max(0, val)));
    }
}
