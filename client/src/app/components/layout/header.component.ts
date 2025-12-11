import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../shared/translate.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="flex items-center justify-end px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
      <div class="flex gap-2">
        <button 
          class="px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-200"
          [class]="translateService.currentLang() === 'en' 
            ? 'bg-emerald-500 border-emerald-500 text-white' 
            : 'bg-white border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-500'"
          (click)="switchLang('en')">
          EN
        </button>
        <button 
          class="px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all duration-200"
          [class]="translateService.currentLang() === 'fr' 
            ? 'bg-emerald-500 border-emerald-500 text-white' 
            : 'bg-white border-gray-300 text-gray-600 hover:border-emerald-500 hover:text-emerald-500'"
          (click)="switchLang('fr')">
          FR
        </button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  constructor(public translateService: TranslateService) {}

  switchLang(lang: string): void {
    this.translateService.setLanguage(lang);
  }
}
