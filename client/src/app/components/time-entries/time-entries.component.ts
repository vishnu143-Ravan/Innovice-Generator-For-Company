import { Component, OnInit } from '@angular/core';
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
import { TimeEntry, Project, TeamMember } from '../../models/models';

@Component({
  selector: 'app-time-entries',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, TextareaModule, InputNumberModule,
    SelectModule, DatePickerModule, ConfirmDialogModule, ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="container">
      <div class="page-header">
        <h2>Time Tracking</h2>
        <p-button icon="pi pi-plus" label="Add Time Entry" (onClick)="openDialog()"></p-button>
      </div>
      
      <div class="card" style="margin-bottom: 1rem;">
        <div class="grid">
          <div class="col-3">
            <label>Filter by Project</label>
            <p-select [(ngModel)]="filterProjectId" [options]="projectOptions" 
                      optionLabel="label" optionValue="value" placeholder="All Projects" 
                      [showClear]="true" class="w-full" (onChange)="loadEntries()"></p-select>
          </div>
          <div class="col-3">
            <label>Filter by Team Member</label>
            <p-select [(ngModel)]="filterTeamMemberId" [options]="teamMemberOptions" 
                      optionLabel="label" optionValue="value" placeholder="All Members" 
                      [showClear]="true" class="w-full" (onChange)="loadEntries()"></p-select>
          </div>
          <div class="col-3">
            <label>From Date</label>
            <p-datepicker [(ngModel)]="filterDateFrom" dateFormat="yy-mm-dd" 
                          class="w-full" (onSelect)="loadEntries()" [showClear]="true"></p-datepicker>
          </div>
          <div class="col-3">
            <label>To Date</label>
            <p-datepicker [(ngModel)]="filterDateTo" dateFormat="yy-mm-dd" 
                          class="w-full" (onSelect)="loadEntries()" [showClear]="true"></p-datepicker>
          </div>
        </div>
      </div>
      
      <div class="card">
        <p-table [value]="timeEntries" [paginator]="true" [rows]="10" [showCurrentPageReport]="true"
                 [rowsPerPageOptions]="[5,10,25,50]" dataKey="id" [loading]="loading"
                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="date">Date <p-sortIcon field="date"></p-sortIcon></th>
              <th>Project</th>
              <th>Team Member</th>
              <th pSortableColumn="hours">Hours <p-sortIcon field="hours"></p-sortIcon></th>
              <th>Amount</th>
              <th>Description</th>
              <th style="width: 150px">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-entry>
            <tr>
              <td>{{ entry.date | date:'mediumDate' }}</td>
              <td>{{ entry.project?.projectName || '-' }}</td>
              <td>
                {{ entry.teamMember?.name || '-' }}
                <span *ngIf="entry.teamMember" class="billing-type-badge ml-2" [class]="entry.teamMember.billingType">
                  {{ entry.teamMember.billingType === 'hourly' ? 'H' : 'M' }}
                </span>
              </td>
              <td>{{ entry.hours }}</td>
              <td>\${{ calculateAmount(entry) | number:'1.2-2' }}</td>
              <td>{{ entry.description || '-' }}</td>
              <td>
                <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="editEntry(entry)"></p-button>
                <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="confirmDelete(entry)"></p-button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="7" class="text-center">No time entries found. Click "Add Time Entry" to create one.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
      
      <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Time Entry' : 'Add Time Entry'" [modal]="true" [style]="{width: '500px'}">
        <div class="form-field">
          <label for="project">Project *</label>
          <p-select id="project" [(ngModel)]="currentEntry.projectId" [options]="projectOptions" 
                    optionLabel="label" optionValue="value" placeholder="Select project" 
                    class="w-full" (onChange)="onProjectChange()"></p-select>
        </div>
        <div class="form-field">
          <label for="teamMember">Team Member *</label>
          <p-select id="teamMember" [(ngModel)]="currentEntry.teamMemberId" [options]="assignedMemberOptions" 
                    optionLabel="label" optionValue="value" placeholder="Select team member" class="w-full"></p-select>
        </div>
        <div class="form-field">
          <label for="date">Date *</label>
          <p-datepicker id="date" [(ngModel)]="entryDateObj" dateFormat="yy-mm-dd" class="w-full"></p-datepicker>
        </div>
        <div class="form-field">
          <label for="hours">Hours *</label>
          <p-inputNumber id="hours" [(ngModel)]="currentEntry.hours" [minFractionDigits]="1" [maxFractionDigits]="2" 
                         [min]="0.1" [max]="24" class="w-full"></p-inputNumber>
        </div>
        <div class="form-field">
          <label for="description">Description</label>
          <textarea pTextarea id="description" [(ngModel)]="currentEntry.description" class="w-full" rows="3"></textarea>
        </div>
        <div class="dialog-footer">
          <p-button label="Cancel" [text]="true" (onClick)="dialogVisible = false"></p-button>
          <p-button label="Save" (onClick)="saveEntry()" [disabled]="!isValid()"></p-button>
        </div>
      </p-dialog>
      
      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `
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
    private messageService: MessageService
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
    const filters: any = {};
    if (this.filterProjectId) filters.projectId = this.filterProjectId;
    if (this.filterTeamMemberId) filters.teamMemberId = this.filterTeamMemberId;
    if (this.filterDateFrom) filters.dateFrom = this.formatDate(this.filterDateFrom);
    if (this.filterDateTo) filters.dateTo = this.formatDate(this.filterDateTo);
    
    this.api.getTimeEntries(filters).subscribe({
      next: (data) => {
        this.timeEntries = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load time entries' });
        this.loading = false;
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
    this.dialogVisible = true;
  }

  editEntry(entry: TimeEntry) {
    this.currentEntry = { ...entry, hours: parseFloat(entry.hours) };
    this.entryDateObj = new Date(entry.date);
    this.onProjectChange();
    this.currentEntry.teamMemberId = entry.teamMemberId;
    this.editMode = true;
    this.dialogVisible = true;
  }

  isValid(): boolean {
    return this.currentEntry.projectId && this.currentEntry.teamMemberId && 
           this.entryDateObj && this.currentEntry.hours > 0;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  saveEntry() {
    const data = {
      ...this.currentEntry,
      date: this.formatDate(this.entryDateObj!),
      hours: String(this.currentEntry.hours)
    };
    
    if (this.editMode && this.currentEntry.id) {
      this.api.updateTimeEntry(this.currentEntry.id, data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Time entry updated' });
          this.loadEntries();
          this.dialogVisible = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update time entry' });
        }
      });
    } else {
      this.api.createTimeEntry(data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Time entry created' });
          this.loadEntries();
          this.dialogVisible = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create time entry' });
        }
      });
    }
  }

  confirmDelete(entry: TimeEntry) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this time entry?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteTimeEntry(entry.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Time entry deleted' });
            this.loadEntries();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete time entry' });
          }
        });
      }
    });
  }
}
