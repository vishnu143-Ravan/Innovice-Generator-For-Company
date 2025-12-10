import { Routes } from '@angular/router';
import { ClientsComponent } from './components/clients/clients.component';
import { TeamMembersComponent } from './components/team-members/team-members.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { TimeEntriesComponent } from './components/time-entries/time-entries.component';
import { InvoicesComponent } from './components/invoices/invoices.component';

export const routes: Routes = [
  { path: '', redirectTo: '/clients', pathMatch: 'full' },
  { path: 'clients', component: ClientsComponent },
  { path: 'team-members', component: TeamMembersComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'time-entries', component: TimeEntriesComponent },
  { path: 'invoices', component: InvoicesComponent }
];
