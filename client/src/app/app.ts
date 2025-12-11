import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar.component';
import { HeaderComponent } from './components/layout/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <app-sidebar></app-sidebar>
    <div class="ml-64">
      <app-header></app-header>
      <div class="min-h-screen bg-gray-100 p-6">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class App {}
