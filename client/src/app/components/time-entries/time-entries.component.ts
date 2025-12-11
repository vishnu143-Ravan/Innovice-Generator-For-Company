import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { ConfirmSaveService } from '../../shared/confirm-save.service';
import { TranslateService } from '../../shared/translate.service';
import { TimeEntry, Project, TeamMember } from '../../models/models';

@Component({
  selector: 'app-time-entries',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, TableModule, ButtonModule,
    SelectModule, DatePickerModule, ConfirmDialogModule, ToastModule
  ],
  templateUrl: './time-entries.component.html'
})
export class TimeEntriesComponent implements OnInit {
  timeEntries: TimeEntry[] = [];
  projects: Project[] = [];
  teamMembers: TeamMember[] = [];
  loading = true;
  
  filterProjectId: number | null = null;
  filterTeamMemberId: number | null = null;
  filterDateFrom: Date | null = null;
  filterDateTo: Date | null = null;
  
  projectOptions: { label: string; value: number }[] = [];
  teamMemberOptions: { label: string; value: number }[] = [];

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private confirmSaveService: ConfirmSaveService,
    private cdr: ChangeDetectorRef,
    public t: TranslateService
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

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
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
