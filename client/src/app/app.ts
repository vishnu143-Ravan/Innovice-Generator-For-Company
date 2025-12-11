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
    <div style="margin-left: 250px;">
      <app-header></app-header>
      <div class="min-vh-100 bg-light p-4">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class App {}
