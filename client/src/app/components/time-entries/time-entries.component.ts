import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { ConfirmSaveService } from '../../shared/confirm-save.service';
import { TimeEntry, Project, TeamMember } from '../../models/models';

@Component({
  selector: 'app-time-entries',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, TextareaModule, InputNumberModule,
    SelectModule, DatePickerModule, ConfirmDialogModule, ToastModule
  ],
  templateUrl: './time-entries.component.html'
})
export class TimeEntriesComponent implements OnInit {
  timeEntries: TimeEntry[] = [];
  projects: Project[] = [];
  teamMembers: TeamMember[] = [];
  loading = false;
  dialogVisible = false;
  editMode = false;
  currentEntry: any = {};
  entryDateObj: Date | null = null;
  submitted = false;
  
  filterProjectId: number | null = null;
  filterTeamMemberId: number | null = null;
  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;
  
  projectOptions: { label: string; value: number }[] = [];
  teamMemberOptions: { label: string; value: number }[] = [];
  assignedMemberOptions: { label: string; value: number }[] = [];

  constructor(
    private api: ApiService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private confirmSaveService: ConfirmSaveService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.projectOptions = data.map(p => ({ label: `${p.projectName} (${p.client?.clientName || 'No Client'})`, value: p.id }));
      }
    });
    
    this.api.getTeamMembers().subscribe({
      next: (data) => {
        this.teamMembers = data;
        this.teamMemberOptions = data.map(m => ({ label: `${m.name} (${m.role})`, value: m.id }));
      }
    });
    
    this.loadEntries();
  }

  loadEntries() {
    this.loading = true;
    this.cdr.detectChanges();
    const filters: any = {};
    if (this.filterProjectId) filters.projectId = this.filterProjectId;
    if (this.filterTeamMemberId) filters.teamMemberId = this.filterTeamMemberId;
    if (this.filterDateFrom) filters.dateFrom = this.formatDate(this.filterDateFrom);
    if (this.filterDateTo) filters.dateTo = this.formatDate(this.filterDateTo);
    
    this.api.getTimeEntries(filters).subscribe({
      next: (data) => {
        this.timeEntries = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load time entries' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateAmount(entry: TimeEntry): number {
    if (!entry.teamMember) return 0;
    const hours = parseFloat(entry.hours);
    const rate = parseFloat(entry.teamMember.rate);
    
    if (entry.teamMember.billingType === 'hourly') {
      return hours * rate;
    } else {
      const daysWorked = hours / 8;
      const workingDaysInMonth = 22;
      return (rate / workingDaysInMonth) * daysWorked;
    }
  }

  onProjectChange() {
    const project = this.projects.find(p => p.id === this.currentEntry.projectId);
    if (project && project.projectAssignments) {
      this.assignedMemberOptions = project.projectAssignments.map(a => ({
        label: `${a.teamMember?.name} (${a.teamMember?.role})`,
        value: a.teamMemberId
      }));
    } else {
      this.assignedMemberOptions = this.teamMemberOptions;
    }
    this.currentEntry.teamMemberId = null;
  }

  openDialog() {
    this.currentEntry = { hours: 8 };
    this.entryDateObj = new Date();
    this.assignedMemberOptions = this.teamMemberOptions;
    this.editMode = false;
    this.submitted = false;
    this.dialogVisible = true;
  }

  editEntry(entry: TimeEntry) {
    this.currentEntry = { ...entry, hours: parseFloat(entry.hours) };
    this.entryDateObj = new Date(entry.date);
    this.onProjectChange();
    this.currentEntry.teamMemberId = entry.teamMemberId;
    this.editMode = true;
    this.submitted = false;
    this.dialogVisible = true;
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
    if (!this.isValid()) return;

    const confirmed = await this.confirmSaveService.confirmSave('time entry');
    if (!confirmed) return;

    const data = {
      ...this.currentEntry,
      date: this.formatDate(this.entryDateObj!),
      hours: String(this.currentEntry.hours)
    };
    
    if (this.editMode && this.currentEntry.id) {
      this.api.updateTimeEntry(this.currentEntry.id, data).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Time entry updated successfully');
          this.loadEntries();
          this.dialogVisible = false;
        },
        error: () => {
          this.confirmSaveService.showError('Failed to update time entry');
        }
      });
    } else {
      this.api.createTimeEntry(data).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Time entry created successfully');
          this.loadEntries();
          this.dialogVisible = false;
        },
        error: () => {
          this.confirmSaveService.showError('Failed to create time entry');
        }
      });
    }
  }

  async confirmDelete(entry: TimeEntry) {
    const confirmed = await this.confirmSaveService.confirmDelete('time entry');
    if (!confirmed) return;

    this.api.deleteTimeEntry(entry.id).subscribe({
      next: () => {
        this.confirmSaveService.showSuccess('Time entry deleted');
        this.loadEntries();
      },
      error: () => {
        this.confirmSaveService.showError('Failed to delete time entry');
      }
    });
  }
}
