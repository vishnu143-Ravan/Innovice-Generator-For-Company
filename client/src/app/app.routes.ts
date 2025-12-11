import { Routes } from '@angular/router';
import { ClientsComponent } from './components/clients/clients.component';
import { ClientFormComponent } from './components/clients/client-form/client-form.component';
import { TeamMembersComponent } from './components/team-members/team-members.component';
import { TeamMemberFormComponent } from './components/team-members/team-member-form/team-member-form.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProjectFormComponent } from './components/projects/project-form/project-form.component';
import { TimeEntriesComponent } from './components/time-entries/time-entries.component';
import { TimeEntryFormComponent } from './components/time-entries/time-entry-form/time-entry-form.component';
import { InvoicesComponent } from './components/invoices/invoices.component';

export const routes: Routes = [
  { path: '', redirectTo: '/clients', pathMatch: 'full' },
  { path: 'clients', component: ClientsComponent },
  { path: 'clients/new', component: ClientFormComponent },
  { path: 'clients/:id/edit', component: ClientFormComponent },
  { path: 'team-members', component: TeamMembersComponent },
  { path: 'team-members/new', component: TeamMemberFormComponent },
  { path: 'team-members/:id/edit', component: TeamMemberFormComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'projects/new', component: ProjectFormComponent },
  { path: 'projects/:id/edit', component: ProjectFormComponent },
  { path: 'time-entries', component: TimeEntriesComponent },
  { path: 'time-entries/new', component: TimeEntryFormComponent },
  { path: 'time-entries/:id/edit', component: TimeEntryFormComponent },
  { path: 'invoices', component: InvoicesComponent }
];
