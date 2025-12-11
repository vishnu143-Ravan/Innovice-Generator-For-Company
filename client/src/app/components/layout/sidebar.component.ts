import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../shared/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
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
    .theme-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.3);
      background: transparent;
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }
    .theme-btn:hover {
      border-color: rgba(255,255,255,0.6);
      color: white;
    }
    .theme-btn.active {
      border-color: #10b981;
      color: #10b981;
    }
    .theme-btn-accent.active {
      background: #10b981;
      border-color: #10b981;
      color: white;
    }
  `]
})
export class SidebarComponent {
  constructor(public themeService: ThemeService) {}
}
