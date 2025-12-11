import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '../../shared/translate.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="d-flex align-items-center justify-content-end px-4 py-2 bg-white border-bottom shadow-sm">
      <div class="d-flex gap-2">
        <button 
          class="btn btn-sm rounded-pill px-3"
          [class.btn-success]="translateService.currentLang() === 'en'"
          [class.btn-outline-secondary]="translateService.currentLang() !== 'en'"
          (click)="switchLang('en')">
          EN
        </button>
        <button 
          class="btn btn-sm rounded-pill px-3"
          [class.btn-success]="translateService.currentLang() === 'fr'"
          [class.btn-outline-secondary]="translateService.currentLang() !== 'fr'"
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
