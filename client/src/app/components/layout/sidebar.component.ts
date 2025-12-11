import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateService } from '../../shared/translate.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col h-screen w-64 bg-gray-900 text-white fixed">
      <div class="flex items-center gap-2 p-4 border-b border-gray-700">
        <img src="logo.png" alt="Uniquode" class="h-8">
      </div>
      <nav class="flex flex-col mt-2">
        <a routerLink="/clients" routerLinkActive="bg-white/15 text-white border-l-4 border-blue-500" 
           class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
          <i class="pi pi-users"></i>
          <span>{{ t.get('nav.clients') }}</span>
        </a>
        <a routerLink="/team-members" routerLinkActive="bg-white/15 text-white border-l-4 border-blue-500" 
           class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
          <i class="pi pi-user"></i>
          <span>{{ t.get('nav.teamMembers') }}</span>
        </a>
        <a routerLink="/projects" routerLinkActive="bg-white/15 text-white border-l-4 border-blue-500" 
           class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
          <i class="pi pi-folder"></i>
          <span>{{ t.get('nav.projects') }}</span>
        </a>
        <a routerLink="/time-entries" routerLinkActive="bg-white/15 text-white border-l-4 border-blue-500" 
           class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
          <i class="pi pi-clock"></i>
          <span>{{ t.get('nav.timeTracking') }}</span>
        </a>
        <a routerLink="/invoices" routerLinkActive="bg-white/15 text-white border-l-4 border-blue-500" 
           class="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
          <i class="pi pi-file"></i>
          <span>{{ t.get('nav.invoices') }}</span>
        </a>
      </nav>
    </div>
  `
})
export class SidebarComponent {
  constructor(public t: TranslateService) {}
}
