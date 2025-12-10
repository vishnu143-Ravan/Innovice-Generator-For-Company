import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { Project, Client, TeamMember } from '../../models/models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, TextareaModule, SelectModule,
    MultiSelectModule, DatePickerModule, ConfirmDialogModule, 
    ToastModule, TagModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Projects</h2>
        <p-button icon="pi pi-plus" label="Add Project" (onClick)="openDialog()"></p-button>
      </div>
      
      <div class="card shadow-sm">
        <div class="card-body">
          <p-table [value]="projects" [paginator]="true" [rows]="10" [showCurrentPageReport]="true"
                   [rowsPerPageOptions]="[5,10,25,50]" dataKey="id" [loading]="loading"
                   currentPageReportTemplate="Showing {first} to {last} of {totalRecords} projects">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="projectName">Project Name <p-sortIcon field="projectName"></p-sortIcon></th>
                <th>Client</th>
                <th>Team Members</th>
                <th pSortableColumn="startDate">Start Date <p-sortIcon field="startDate"></p-sortIcon></th>
                <th>End Date</th>
                <th>Status</th>
                <th style="width: 150px">Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-project>
              <tr>
                <td>{{ project.projectName }}</td>
                <td>{{ project.client?.clientName || '-' }}</td>
                <td>
                  <span *ngFor="let a of project.projectAssignments; let last = last">
                    {{ a.teamMember?.name }}{{ !last ? ', ' : '' }}
                  </span>
                  <span *ngIf="!project.projectAssignments?.length">-</span>
                </td>
                <td>{{ project.startDate | date:'mediumDate' }}</td>
                <td>{{ project.endDate ? (project.endDate | date:'mediumDate') : '-' }}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(project.status)">{{ formatStatus(project.status) }}</span>
                </td>
                <td>
                  <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="editProject(project)"></p-button>
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="confirmDelete(project)"></p-button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" class="text-center text-muted py-4">No projects found. Click "Add Project" to create one.</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
      
      <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Project' : 'Add Project'" [modal]="true" [style]="{width: '600px'}">
        <div class="mb-3">
          <label for="projectName" class="form-label fw-semibold">Project Name *</label>
          <input pInputText id="projectName" [(ngModel)]="currentProject.projectName" class="w-100" required />
        </div>
        <div class="mb-3">
          <label for="client" class="form-label fw-semibold">Client *</label>
          <p-select id="client" [(ngModel)]="currentProject.clientId" [options]="clientOptions" 
                    optionLabel="label" optionValue="value" placeholder="Select client" class="w-100"></p-select>
        </div>
        <div class="mb-3">
          <label for="description" class="form-label fw-semibold">Description</label>
          <textarea pTextarea id="description" [(ngModel)]="currentProject.description" class="w-100" rows="3"></textarea>
        </div>
        <div class="row">
          <div class="col-6">
            <div class="mb-3">
              <label for="startDate" class="form-label fw-semibold">Start Date *</label>
              <p-datepicker id="startDate" [(ngModel)]="startDateObj" dateFormat="yy-mm-dd" class="w-100"></p-datepicker>
            </div>
          </div>
          <div class="col-6">
            <div class="mb-3">
              <label for="endDate" class="form-label fw-semibold">End Date</label>
              <p-datepicker id="endDate" [(ngModel)]="endDateObj" dateFormat="yy-mm-dd" class="w-100"></p-datepicker>
            </div>
          </div>
        </div>
        <div class="mb-3">
          <label for="status" class="form-label fw-semibold">Status *</label>
          <p-select id="status" [(ngModel)]="currentProject.status" [options]="statusOptions" 
                    optionLabel="label" optionValue="value" placeholder="Select status" class="w-100"></p-select>
        </div>
        <div class="mb-3">
          <label for="teamMembers" class="form-label fw-semibold">Assign Team Members</label>
          <p-multiSelect id="teamMembers" [(ngModel)]="selectedTeamMemberIds" [options]="teamMemberOptions"
                         optionLabel="label" optionValue="value" placeholder="Select team members" class="w-100"></p-multiSelect>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-4">
          <p-button label="Cancel" [text]="true" (onClick)="dialogVisible = false"></p-button>
          <p-button label="Save" (onClick)="saveProject()" [disabled]="!isValid()"></p-button>
        </div>
      </p-dialog>
      
      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  clients: Client[] = [];
  teamMembers: TeamMember[] = [];
  loading = false;
  dialogVisible = false;
  editMode = false;
  currentProject: any = {};
  selectedTeamMemberIds: number[] = [];
  startDateObj: Date | null = null;
  endDateObj: Date | null = null;
  
  clientOptions: { label: string; value: number }[] = [];
  teamMemberOptions: { label: string; value: number }[] = [];
  
  statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'On Hold', value: 'on_hold' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  constructor(
    private api: ApiService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.api.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load projects' });
        this.loading = false;
      }
    });
    
    this.api.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.clientOptions = data.map(c => ({ label: c.clientName, value: c.id }));
      }
    });
    
    this.api.getTeamMembers().subscribe({
      next: (data) => {
        this.teamMembers = data;
        this.teamMemberOptions = data.map(m => ({ label: `${m.name} (${m.role})`, value: m.id }));
      }
    });
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'pending': 'bg-warning text-dark',
      'in_progress': 'bg-info text-dark',
      'completed': 'bg-success',
      'on_hold': 'bg-secondary',
      'cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  openDialog() {
    this.currentProject = { status: 'pending' };
    this.selectedTeamMemberIds = [];
    this.startDateObj = null;
    this.endDateObj = null;
    this.editMode = false;
    this.dialogVisible = true;
  }

  editProject(project: Project) {
    this.currentProject = { ...project };
    this.selectedTeamMemberIds = project.projectAssignments?.map(a => a.teamMemberId) || [];
    this.startDateObj = project.startDate ? new Date(project.startDate) : null;
    this.endDateObj = project.endDate ? new Date(project.endDate) : null;
    this.editMode = true;
    this.dialogVisible = true;
  }

  isValid(): boolean {
    return this.currentProject.projectName && this.currentProject.clientId && 
           this.startDateObj && this.currentProject.status;
  }

  saveProject() {
    const data = {
      ...this.currentProject,
      startDate: this.startDateObj ? this.formatDate(this.startDateObj) : null,
      endDate: this.endDateObj ? this.formatDate(this.endDateObj) : null,
      teamMemberIds: this.selectedTeamMemberIds
    };
    
    if (this.editMode && this.currentProject.id) {
      this.api.updateProject(this.currentProject.id, data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project updated' });
          this.loadData();
          this.dialogVisible = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update project' });
        }
      });
    } else {
      this.api.createProject(data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project created' });
          this.loadData();
          this.dialogVisible = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create project' });
        }
      });
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  confirmDelete(project: Project) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${project.projectName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteProject(project.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Project deleted' });
            this.loadData();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete project' });
          }
        });
      }
    });
  }
}
