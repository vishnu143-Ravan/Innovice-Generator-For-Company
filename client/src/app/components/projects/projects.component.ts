import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { ConfirmSaveService } from '../../shared/confirm-save.service';
import { TranslateService } from '../../shared/translate.service';
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
  templateUrl: './projects.component.html'
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
  submitted = false;
  
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
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private confirmSaveService: ConfirmSaveService,
    public t: TranslateService
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
        this.teamMemberOptions = data.map(m => ({ label: m.name, value: m.id }));
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
    this.submitted = false;
    this.dialogVisible = true;
  }

  editProject(project: Project) {
    this.currentProject = { ...project };
    this.selectedTeamMemberIds = project.projectAssignments?.map(a => a.teamMemberId) || [];
    this.startDateObj = project.startDate ? new Date(project.startDate) : null;
    this.endDateObj = project.endDate ? new Date(project.endDate) : null;
    this.editMode = true;
    this.submitted = false;
    this.dialogVisible = true;
  }

  isValid(): boolean {
    return this.currentProject.projectName && this.currentProject.clientId && 
           this.startDateObj && this.currentProject.status;
  }

  async saveProject() {
    this.submitted = true;
    if (!this.isValid()) return;

    const confirmed = await this.confirmSaveService.confirmSave('project');
    if (!confirmed) return;

    const data = {
      ...this.currentProject,
      startDate: this.startDateObj ? this.formatDate(this.startDateObj) : null,
      endDate: this.endDateObj ? this.formatDate(this.endDateObj) : null,
      teamMemberIds: this.selectedTeamMemberIds
    };
    
    if (this.editMode && this.currentProject.id) {
      this.api.updateProject(this.currentProject.id, data).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Project updated successfully');
          this.loadData();
          this.dialogVisible = false;
        },
        error: () => {
          this.confirmSaveService.showError('Failed to update project');
        }
      });
    } else {
      this.api.createProject(data).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Project created successfully');
          this.loadData();
          this.dialogVisible = false;
        },
        error: () => {
          this.confirmSaveService.showError('Failed to create project');
        }
      });
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async confirmDelete(project: Project) {
    const confirmed = await this.confirmSaveService.confirmDelete('project', project.projectName);
    if (!confirmed) return;

    this.api.deleteProject(project.id).subscribe({
      next: () => {
        this.confirmSaveService.showSuccess('Project deleted');
        this.loadData();
      },
      error: () => {
        this.confirmSaveService.showError('Failed to delete project');
      }
    });
  }
}
