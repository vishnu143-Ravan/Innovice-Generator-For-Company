import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../services/api.service';
import { ConfirmSaveService } from '../../../shared/confirm-save.service';
import { TranslateService } from '../../../shared/translate.service';
import { Project, TeamMember } from '../../../models/models';

@Component({
  selector: 'app-time-entry-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule,
    TextareaModule, InputNumberModule, SelectModule, DatePickerModule,
    ToastModule, ConfirmDialogModule
  ],
  templateUrl: './time-entry-form.component.html'
})
export class TimeEntryFormComponent implements OnInit {
  editMode = false;
  entryId: number | null = null;
  currentEntry: any = { hours: 8 };
  entryDateObj: Date | null = new Date();
  submitted = false;
  loading = false;
  loadError = false;
  dropdownsLoaded = false;
  
  projects: Project[] = [];
  teamMembers: TeamMember[] = [];
  projectOptions: { label: string; value: number }[] = [];
  teamMemberOptions: { label: string; value: number }[] = [];
  assignedMemberOptions: { label: string; value: number }[] = [];

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmSaveService: ConfirmSaveService,
    public t: TranslateService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.entryId = parseInt(id);
    }
    
    this.loadDropdownDataAndEntry();
  }

  loadDropdownDataAndEntry() {
    this.loading = true;
    
    forkJoin({
      projects: this.api.getProjects(),
      teamMembers: this.api.getTeamMembers()
    }).subscribe({
      next: ({ projects, teamMembers }) => {
        this.projects = projects;
        this.projectOptions = projects.map(p => ({ 
          label: `${p.projectName} (${p.client?.clientName || 'No Client'})`, 
          value: p.id 
        }));
        
        this.teamMembers = teamMembers;
        this.teamMemberOptions = teamMembers.map(m => ({ 
          label: `${m.name} (${m.role})`, 
          value: m.id 
        }));
        this.assignedMemberOptions = this.teamMemberOptions;
        this.dropdownsLoaded = true;
        
        if (this.editMode && this.entryId) {
          this.loadEntry();
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load dropdown data' });
        this.loading = false;
        this.loadError = true;
      }
    });
  }

  loadEntry() {
    if (!this.entryId) return;
    
    this.api.getTimeEntry(this.entryId).subscribe({
      next: (entry) => {
        this.currentEntry = { ...entry, hours: parseFloat(entry.hours) };
        this.entryDateObj = new Date(entry.date);
        this.updateAssignedMembers();
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load time entry' });
        this.loading = false;
        this.loadError = true;
      }
    });
  }

  updateAssignedMembers() {
    const project = this.projects.find(p => p.id === this.currentEntry.projectId);
    if (project && project.projectAssignments && project.projectAssignments.length > 0) {
      this.assignedMemberOptions = project.projectAssignments.map(a => ({
        label: `${a.teamMember?.name} (${a.teamMember?.role})`,
        value: a.teamMemberId
      }));
    } else {
      this.assignedMemberOptions = this.teamMemberOptions;
    }
  }

  onProjectChange() {
    const currentMemberId = this.currentEntry.teamMemberId;
    this.updateAssignedMembers();
    
    const isValidMember = this.assignedMemberOptions.some(m => m.value === currentMemberId);
    if (!isValidMember) {
      this.currentEntry.teamMemberId = null;
    }
  }

  isValid(): boolean {
    return this.currentEntry.projectId && this.currentEntry.teamMemberId && 
           this.entryDateObj && this.currentEntry.hours > 0;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async saveEntry() {
    this.submitted = true;
    if (!this.isValid() || this.loadError) return;

    const confirmed = await this.confirmSaveService.confirmSave('time entry');
    if (!confirmed) return;

    const data = {
      ...this.currentEntry,
      date: this.formatDate(this.entryDateObj!),
      hours: String(this.currentEntry.hours)
    };
    
    if (this.editMode && this.entryId) {
      this.api.updateTimeEntry(this.entryId, data).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Time entry updated successfully');
          this.router.navigate(['/time-entries']);
        },
        error: () => {
          this.confirmSaveService.showError('Failed to update time entry');
        }
      });
    } else {
      this.api.createTimeEntry(data).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Time entry created successfully');
          this.router.navigate(['/time-entries']);
        },
        error: () => {
          this.confirmSaveService.showError('Failed to create time entry');
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/time-entries']);
  }
}
