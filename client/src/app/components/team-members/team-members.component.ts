import { Component, OnInit } from '@angular/core';
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
    <div class="container">
      <div class="page-header">
        <h2>Team Members</h2>
        <p-button icon="pi pi-plus" label="Add Team Member" (onClick)="openDialog()"></p-button>
      </div>
      
      <div class="card">
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
                <span class="billing-type-badge" [class]="member.billingType">
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
              <td colspan="6" class="text-center">No team members found. Click "Add Team Member" to create one.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
      
      <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Team Member' : 'Add Team Member'" [modal]="true" [style]="{width: '500px'}">
        <div class="form-field">
          <label for="name">Name *</label>
          <input pInputText id="name" [(ngModel)]="currentMember.name" class="w-full" required />
        </div>
        <div class="form-field">
          <label for="email">Email *</label>
          <input pInputText id="email" [(ngModel)]="currentMember.email" class="w-full" type="email" required />
        </div>
        <div class="form-field">
          <label for="role">Role *</label>
          <input pInputText id="role" [(ngModel)]="currentMember.role" class="w-full" required />
        </div>
        <div class="form-field">
          <label for="billingType">Billing Type *</label>
          <p-select id="billingType" [(ngModel)]="currentMember.billingType" [options]="billingTypes" 
                    optionLabel="label" optionValue="value" placeholder="Select billing type" class="w-full"></p-select>
        </div>
        <div class="form-field">
          <label for="rate">Rate *</label>
          <p-inputNumber id="rate" [(ngModel)]="currentMember.rate" mode="currency" currency="USD" locale="en-US" class="w-full"></p-inputNumber>
        </div>
        <div class="dialog-footer">
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
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.loading = true;
    this.api.getTeamMembers().subscribe({
      next: (data) => {
        this.teamMembers = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load team members' });
        this.loading = false;
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
    const data = { ...this.currentMember, rate: String(this.currentMember.rate) };
    
    if (this.editMode && this.currentMember.id) {
      this.api.updateTeamMember(this.currentMember.id, data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Team member updated' });
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
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Team member created' });
          this.loadMembers();
          this.dialogVisible = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create team member' });
        }
      });
    }
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
