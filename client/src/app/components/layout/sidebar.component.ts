import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  `]
})
export class SidebarComponent {}
