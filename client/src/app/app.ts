import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <app-sidebar></app-sidebar>
    <div class="main-content bg-light min-vh-100 p-3" style="margin-left: 250px;">
      <router-outlet></router-outlet>
    </div>
  `
})
export class App {}
