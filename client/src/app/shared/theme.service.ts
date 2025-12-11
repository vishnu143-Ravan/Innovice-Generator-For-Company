import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'uniquode-theme';
  
  isDarkMode = signal(this.getStoredTheme());

  constructor() {
    this.applyTheme(this.isDarkMode());
  }

  private getStoredTheme(): boolean {
    const stored = localStorage.getItem(this.THEME_KEY);
    return stored ? stored === 'dark' : true;
  }

  toggleTheme(): void {
    const newMode = !this.isDarkMode();
    this.isDarkMode.set(newMode);
    localStorage.setItem(this.THEME_KEY, newMode ? 'dark' : 'light');
    this.applyTheme(newMode);
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    const body = document.body;
    if (isDark) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }
}
