import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../shared/translate.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header d-flex align-items-center justify-content-end px-4 py-2 bg-white border-bottom">
      <div class="lang-switcher d-flex gap-2">
        <button 
          class="lang-btn" 
          [class.active]="translateService.currentLang() === 'en'"
          (click)="switchLang('en')">
          EN
        </button>
        <button 
          class="lang-btn" 
          [class.active]="translateService.currentLang() === 'fr'"
          (click)="switchLang('fr')">
          FR
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: 50px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .lang-btn {
      padding: 6px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 20px;
      background: white;
      color: #666;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .lang-btn:hover {
      border-color: #10b981;
      color: #10b981;
    }
    .lang-btn.active {
      background: #10b981;
      border-color: #10b981;
      color: white;
    }
  `]
})
export class HeaderComponent {
  constructor(public translateService: TranslateService) {}

  switchLang(lang: string): void {
    this.translateService.setLanguage(lang);
  }
}
