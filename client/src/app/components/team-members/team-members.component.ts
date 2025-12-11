import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { TeamMember } from '../../models/models';

@Component({
  selector: 'app-team-members',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, InputNumberModule, SelectModule,
    ConfirmDialogModule, ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Team Members</h2>
        <p-button icon="pi pi-plus" label="Add Team Member" (onClick)="openDialog()"></p-button>
      </div>
      
      <div class="card shadow-sm">
        <div class="card-body">
          <p-table [value]="teamMembers" [paginator]="true" [rows]="10" [showCurrentPageReport]="true"
                   [rowsPerPageOptions]="[5,10,25,50]" dataKey="id" [loading]="loading"
                   currentPageReportTemplate="Showing {first} to {last} of {totalRecords} members">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="name">Name <p-sortIcon field="name"></p-sortIcon></th>
                <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
                <th pSortableColumn="role">Role <p-sortIcon field="role"></p-sortIcon></th>
                <th>Billing Type</th>
                <th pSortableColumn="rate">Rate <p-sortIcon field="rate"></p-sortIcon></th>
                <th style="width: 150px">Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-member>
              <tr>
                <td>{{ member.name }}</td>
                <td>{{ member.email }}</td>
                <td>{{ member.role }}</td>
                <td>
                  <span class="badge" [ngClass]="member.billingType === 'hourly' ? 'bg-primary' : 'bg-info'">
                    {{ member.billingType === 'hourly' ? 'Hourly' : 'Monthly' }}
                  </span>
                </td>
                <td>\${{ member.rate }}{{ member.billingType === 'hourly' ? '/hr' : '/mo' }}</td>
                <td>
                  <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="editMember(member)"></p-button>
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="confirmDelete(member)"></p-button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center text-muted py-4">No team members found. Click "Add Team Member" to create one.</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
      
      <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Team Member' : 'Add Team Member'" [modal]="true" [style]="{width: '500px'}">
        <div class="mb-3">
          <label for="name" class="form-label fw-semibold">Name *</label>
          <input pInputText id="name" [(ngModel)]="currentMember.name" class="w-100" required />
        </div>
        <div class="mb-3">
          <label for="email" class="form-label fw-semibold">Email *</label>
          <input pInputText id="email" [(ngModel)]="currentMember.email" class="w-100" type="email" required />
        </div>
        <div class="mb-3">
          <label for="role" class="form-label fw-semibold">Role *</label>
          <input pInputText id="role" [(ngModel)]="currentMember.role" class="w-100" required />
        </div>
        <div class="mb-3">
          <label for="billingType" class="form-label fw-semibold">Billing Type *</label>
          <p-select id="billingType" [(ngModel)]="currentMember.billingType" [options]="billingTypes" 
                    optionLabel="label" optionValue="value" placeholder="Select billing type" class="w-100"></p-select>
        </div>
        <div class="mb-3">
          <label for="rate" class="form-label fw-semibold">Rate *</label>
          <p-inputNumber id="rate" [(ngModel)]="currentMember.rate" mode="currency" currency="USD" locale="en-US" class="w-100"></p-inputNumber>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-4">
          <p-button label="Cancel" [text]="true" (onClick)="dialogVisible = false"></p-button>
          <p-button label="Save" (onClick)="saveMember()" [disabled]="!isValid()"></p-button>
        </div>
      </p-dialog>
      
      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `
})
export class TeamMembersComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  loading = false;
  dialogVisible = false;
  editMode = false;
  currentMember: any = {};
  
  billingTypes = [
    { label: 'Hourly', value: 'hourly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  constructor(
    private api: ApiService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.loading = true;
    this.cdr.detectChanges();
    this.api.getTeamMembers().subscribe({
      next: (data) => {
        this.teamMembers = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load team members' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openDialog() {
    this.currentMember = { billingType: 'hourly' };
    this.editMode = false;
    this.dialogVisible = true;
  }

  editMember(member: TeamMember) {
    this.currentMember = { ...member, rate: parseFloat(member.rate) };
    this.editMode = true;
    this.dialogVisible = true;
  }

  isValid(): boolean {
    return this.currentMember.name && this.currentMember.email && 
           this.currentMember.role && this.currentMember.billingType && this.currentMember.rate;
  }

  saveMember() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to save this team member?',
      header: 'Confirm Save',
      icon: 'pi pi-check-circle',
      accept: () => {
        const data = { ...this.currentMember, rate: String(this.currentMember.rate) };
        
        if (this.editMode && this.currentMember.id) {
          this.api.updateTeamMember(this.currentMember.id, data).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Team member updated successfully' });
              this.loadMembers();
              this.dialogVisible = false;
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update team member' });
            }
          });
        } else {
          this.api.createTeamMember(data).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Team member created successfully' });
              this.loadMembers();
              this.dialogVisible = false;
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create team member' });
            }
          });
        }
      }
    });
  }

  confirmDelete(member: TeamMember) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${member.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteTeamMember(member.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Team member deleted' });
            this.loadMembers();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete team member' });
          }
        });
      }
    });
  }
}
