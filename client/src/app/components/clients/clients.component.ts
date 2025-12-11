import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { ConfirmSaveService } from '../../shared/confirm-save.service';
import { Client } from '../../models/models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, 
    DialogModule, InputTextModule, TextareaModule, 
    ConfirmDialogModule, ToastModule
  ],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Clients</h2>
        <p-button icon="pi pi-plus" label="Add Client" (onClick)="openDialog()"></p-button>
      </div>
      
      <div class="card shadow-sm">
        <div class="card-body">
          <p-table [value]="clients" [paginator]="true" [rows]="10" [showCurrentPageReport]="true"
                   [rowsPerPageOptions]="[5,10,25,50]" dataKey="id" [loading]="loading"
                   currentPageReportTemplate="Showing {first} to {last} of {totalRecords} clients">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="clientName">Name <p-sortIcon field="clientName"></p-sortIcon></th>
                <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
                <th>Phone</th>
                <th>Address</th>
                <th style="width: 150px">Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-client>
              <tr>
                <td>{{ client.clientName }}</td>
                <td>{{ client.email }}</td>
                <td>{{ client.phone || '-' }}</td>
                <td>{{ client.address || '-' }}</td>
                <td>
                  <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="editClient(client)"></p-button>
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="confirmDelete(client)"></p-button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center text-muted py-4">No clients found. Click "Add Client" to create one.</td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
      
      <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Client' : 'Add Client'" [modal]="true" [style]="{width: '500px'}">
        <div class="mb-3">
          <label for="clientName" class="form-label fw-semibold">Client Name <span class="text-danger">*</span></label>
          <input pInputText id="clientName" [(ngModel)]="currentClient.clientName" class="w-100" 
                 [ngClass]="{'ng-invalid ng-dirty': submitted && !currentClient.clientName}" />
          <small *ngIf="submitted && !currentClient.clientName" class="text-danger">Client name is required</small>
        </div>
        <div class="mb-3">
          <label for="email" class="form-label fw-semibold">Email <span class="text-danger">*</span></label>
          <input pInputText id="email" [(ngModel)]="currentClient.email" class="w-100" type="email"
                 [ngClass]="{'ng-invalid ng-dirty': submitted && !currentClient.email}" />
          <small *ngIf="submitted && !currentClient.email" class="text-danger">Email is required</small>
          <small *ngIf="submitted && currentClient.email && !isValidEmail(currentClient.email)" class="text-danger">Please enter a valid email</small>
        </div>
        <div class="mb-3">
          <label for="phone" class="form-label fw-semibold">Phone</label>
          <input pInputText id="phone" [(ngModel)]="currentClient.phone" class="w-100" />
        </div>
        <div class="mb-3">
          <label for="address" class="form-label fw-semibold">Address</label>
          <textarea pTextarea id="address" [(ngModel)]="currentClient.address" class="w-100" rows="3"></textarea>
        </div>
        <div class="d-flex justify-content-end gap-2 mt-4">
          <p-button label="Cancel" [text]="true" (onClick)="dialogVisible = false"></p-button>
          <p-button label="Save" (onClick)="saveClient()"></p-button>
        </div>
      </p-dialog>
      
      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  loading = false;
  dialogVisible = false;
  editMode = false;
  currentClient: Partial<Client> = {};
  submitted = false;

  constructor(
    private api: ApiService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private confirmSaveService: ConfirmSaveService
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.loading = true;
    this.cdr.detectChanges();
    this.api.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load clients' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openDialog() {
    this.currentClient = {};
    this.editMode = false;
    this.submitted = false;
    this.dialogVisible = true;
  }

  editClient(client: Client) {
    this.currentClient = { ...client };
    this.editMode = true;
    this.submitted = false;
    this.dialogVisible = true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValid(): boolean {
    return !!this.currentClient.clientName && 
           !!this.currentClient.email && 
           this.isValidEmail(this.currentClient.email);
  }

  async saveClient() {
    this.submitted = true;
    if (!this.isValid()) return;

    const confirmed = await this.confirmSaveService.confirmSave('client');
    if (!confirmed) return;

    if (this.editMode && this.currentClient.id) {
      this.api.updateClient(this.currentClient.id, this.currentClient).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Client updated successfully');
          this.loadClients();
          this.dialogVisible = false;
        },
        error: () => {
          this.confirmSaveService.showError('Failed to update client');
        }
      });
    } else {
      this.api.createClient(this.currentClient).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Client created successfully');
          this.loadClients();
          this.dialogVisible = false;
        },
        error: () => {
          this.confirmSaveService.showError('Failed to create client');
        }
      });
    }
  }

  async confirmDelete(client: Client) {
    const confirmed = await this.confirmSaveService.confirmDelete('client', client.clientName);
    if (!confirmed) return;

    this.api.deleteClient(client.id).subscribe({
      next: () => {
        this.confirmSaveService.showSuccess('Client deleted');
        this.loadClients();
      },
      error: () => {
        this.confirmSaveService.showError('Failed to delete client');
      }
    });
  }
}
