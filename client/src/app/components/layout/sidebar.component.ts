import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar">
      <div class="logo">
        <i class="pi pi-briefcase"></i>
        <span>Project Manager</span>
      </div>
      <nav>
        <a routerLink="/clients" routerLinkActive="active">
          <i class="pi pi-users"></i>
          <span>Clients</span>
        </a>
        <a routerLink="/team-members" routerLinkActive="active">
          <i class="pi pi-user"></i>
          <span>Team Members</span>
        </a>
        <a routerLink="/projects" routerLinkActive="active">
          <i class="pi pi-folder"></i>
          <span>Projects</span>
        </a>
        <a routerLink="/time-entries" routerLinkActive="active">
          <i class="pi pi-clock"></i>
          <span>Time Tracking</span>
        </a>
        <a routerLink="/invoices" routerLinkActive="active">
          <i class="pi pi-file"></i>
          <span>Invoices</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100vh;
      background: linear-gradient(180deg, #1e3a5f 0%, #0d1b2a 100%);
      position: fixed;
      left: 0;
      top: 0;
      padding: 1rem 0;
      display: flex;
      flex-direction: column;
    }
    
    .logo {
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      font-size: 1.25rem;
      font-weight: 600;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 1rem;
      
      i {
        font-size: 1.5rem;
      }
    }
    
    nav {
      display: flex;
      flex-direction: column;
      
      a {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.875rem 1.5rem;
        color: rgba(255,255,255,0.7);
        text-decoration: none;
        transition: all 0.2s;
        
        i {
          font-size: 1.1rem;
        }
        
        &:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        
        &.active {
          background: rgba(255,255,255,0.15);
          color: white;
          border-left: 3px solid #4dabf7;
        }
      }
    }
  `]
})
export class SidebarComponent {}
