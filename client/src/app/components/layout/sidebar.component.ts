import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateService } from '../../shared/translate.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="d-flex flex-column vh-100 bg-dark text-white position-fixed" style="width: 250px;">
      <div class="d-flex align-items-center gap-2 p-3 border-bottom border-secondary">
        <img src="logo.png" alt="Uniquode" style="height: 32px;">
      </div>
      <nav class="d-flex flex-column mt-2">
        <a routerLink="/clients" routerLinkActive="active bg-white bg-opacity-10 text-white border-start border-primary border-4" 
           class="d-flex align-items-center gap-3 px-3 py-2 text-secondary text-decoration-none">
          <i class="pi pi-users"></i>
          <span>{{ t.get('nav.clients') }}</span>
        </a>
        <a routerLink="/team-members" routerLinkActive="active bg-white bg-opacity-10 text-white border-start border-primary border-4" 
           class="d-flex align-items-center gap-3 px-3 py-2 text-secondary text-decoration-none">
          <i class="pi pi-user"></i>
          <span>{{ t.get('nav.teamMembers') }}</span>
        </a>
        <a routerLink="/projects" routerLinkActive="active bg-white bg-opacity-10 text-white border-start border-primary border-4" 
           class="d-flex align-items-center gap-3 px-3 py-2 text-secondary text-decoration-none">
          <i class="pi pi-folder"></i>
          <span>{{ t.get('nav.projects') }}</span>
        </a>
        <a routerLink="/time-entries" routerLinkActive="active bg-white bg-opacity-10 text-white border-start border-primary border-4" 
           class="d-flex align-items-center gap-3 px-3 py-2 text-secondary text-decoration-none">
          <i class="pi pi-clock"></i>
          <span>{{ t.get('nav.timeTracking') }}</span>
        </a>
        <a routerLink="/invoices" routerLinkActive="active bg-white bg-opacity-10 text-white border-start border-primary border-4" 
           class="d-flex align-items-center gap-3 px-3 py-2 text-secondary text-decoration-none">
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
