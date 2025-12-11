import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../services/api.service';
import { ConfirmSaveService } from '../../../shared/confirm-save.service';
import { TranslateService } from '../../../shared/translate.service';
import { Client, TeamMember } from '../../../models/models';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule,
    TextareaModule, SelectModule, MultiSelectModule, DatePickerModule,
    CardModule, ToastModule, ConfirmDialogModule
  ],
  templateUrl: './project-form.component.html'
})
export class ProjectFormComponent implements OnInit {
  editMode = false;
  projectId: number | null = null;
  currentProject: any = { status: 'pending' };
  selectedTeamMemberIds: number[] = [];
  startDateObj: Date | null = null;
  endDateObj: Date | null = null;
  submitted = false;
  loading = false;
  loadError = false;
  
  clients: Client[] = [];
  teamMembers: TeamMember[] = [];
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
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmSaveService: ConfirmSaveService,
    public t: TranslateService
  ) {}

  ngOnInit() {
    this.loadDropdownData();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.projectId = parseInt(id);
      this.loadProject();
    }
  }

  loadDropdownData() {
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

  loadProject() {
    if (!this.projectId) return;
    
    this.loading = true;
    this.api.getProject(this.projectId).subscribe({
      next: (project) => {
        this.currentProject = { ...project };
        this.selectedTeamMemberIds = project.projectAssignments?.map(a => a.teamMemberId) || [];
        this.startDateObj = project.startDate ? new Date(project.startDate) : null;
        this.endDateObj = project.endDate ? new Date(project.endDate) : null;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load project' });
        this.loading = false;
        this.loadError = true;
      }
    });
  }

  isValid(): boolean {
    return this.currentProject.projectName && this.currentProject.clientId && 
           this.startDateObj && this.currentProject.status;
  }

  async saveProject() {
    this.submitted = true;
    if (!this.isValid() || this.loadError) return;

    const confirmed = await this.confirmSaveService.confirmSave('project');
    if (!confirmed) return;

    const data = {
      ...this.currentProject,
      startDate: this.startDateObj ? this.formatDate(this.startDateObj) : null,
      endDate: this.endDateObj ? this.formatDate(this.endDateObj) : null,
      teamMemberIds: this.selectedTeamMemberIds
    };
    
    if (this.editMode && this.projectId) {
      this.api.updateProject(this.projectId, data).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Project updated successfully');
          this.router.navigate(['/projects']);
        },
        error: () => {
          this.confirmSaveService.showError('Failed to update project');
        }
      });
    } else {
      this.api.createProject(data).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Project created successfully');
          this.router.navigate(['/projects']);
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

  cancel() {
    this.router.navigate(['/projects']);
  }
}
