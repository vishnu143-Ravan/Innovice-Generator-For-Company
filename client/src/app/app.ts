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
    <div class="main-wrapper" style="margin-left: 250px;">
      <app-header></app-header>
      <div class="main-content bg-light min-vh-100 p-3">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class App {}
