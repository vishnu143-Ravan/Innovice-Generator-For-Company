import { Injectable, signal, computed, inject, ApplicationRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private readonly LANG_KEY = 'uniquode-lang';
  private translations = signal<any>({});
  
  currentLang = signal(this.getStoredLang());
  isLoaded = signal(false);

  private http = inject(HttpClient);
  private appRef = inject(ApplicationRef);

  constructor() {
    this.loadTranslations(this.currentLang());
  }

  private getStoredLang(): string {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.LANG_KEY) || 'en';
    }
    return 'en';
  }

  async loadTranslations(lang: string): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get<any>(`/assets/i18n/${lang}.json`));
      this.translations.set(data);
      this.isLoaded.set(true);
      this.appRef.tick();
    } catch {
      console.error(`Failed to load ${lang} translations`);
      this.translations.set({});
      this.isLoaded.set(true);
    }
  }

  async setLanguage(lang: string): Promise<void> {
    this.currentLang.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.LANG_KEY, lang);
    }
    await this.loadTranslations(lang);
  }

  get(key: string): string {
    const keys = key.split('.');
    let result = this.translations();
    
    for (const k of keys) {
      if (result && result[k] !== undefined) {
        result = result[k];
      } else {
        return key;
      }
    }
    
    return typeof result === 'string' ? result : key;
  }
}
