import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="d-flex flex-column vh-100 bg-dark text-white position-fixed" style="width: 250px;">
      <div class="d-flex align-items-center gap-2 p-3 border-bottom border-secondary">
        <img src="logo.png" alt="Uniquode" style="height: 32px;">
      </div>
      <nav class="nav flex-column mt-2">
        <a routerLink="/clients" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2 text-white-50 py-3 px-3">
          <i class="pi pi-users"></i>
          <span>Clients</span>
        </a>
        <a routerLink="/team-members" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2 text-white-50 py-3 px-3">
          <i class="pi pi-user"></i>
          <span>Team Members</span>
        </a>
        <a routerLink="/projects" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2 text-white-50 py-3 px-3">
          <i class="pi pi-folder"></i>
          <span>Projects</span>
        </a>
        <a routerLink="/time-entries" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2 text-white-50 py-3 px-3">
          <i class="pi pi-clock"></i>
          <span>Time Tracking</span>
        </a>
        <a routerLink="/invoices" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2 text-white-50 py-3 px-3">
          <i class="pi pi-file"></i>
          <span>Invoices</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .nav-link:hover {
      background: rgba(255,255,255,0.1);
      color: white !important;
    }
    .nav-link.active {
      background: rgba(255,255,255,0.15);
      color: white !important;
      border-left: 3px solid #0d6efd;
    }
  `]
})
export class SidebarComponent {}
