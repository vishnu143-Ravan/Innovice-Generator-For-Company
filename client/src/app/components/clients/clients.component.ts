import { Component, OnInit } from '@angular/core';
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
import { Client } from '../../models/models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, 
    DialogModule, InputTextModule, TextareaModule, 
    ConfirmDialogModule, ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="container">
      <div class="page-header">
        <h2>Clients</h2>
        <p-button icon="pi pi-plus" label="Add Client" (onClick)="openDialog()"></p-button>
      </div>
      
      <div class="card">
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
              <td colspan="5" class="text-center">No clients found. Click "Add Client" to create one.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
      
      <p-dialog [(visible)]="dialogVisible" [header]="editMode ? 'Edit Client' : 'Add Client'" [modal]="true" [style]="{width: '500px'}">
        <div class="form-field">
          <label for="clientName">Client Name *</label>
          <input pInputText id="clientName" [(ngModel)]="currentClient.clientName" class="w-full" required />
        </div>
        <div class="form-field">
          <label for="email">Email *</label>
          <input pInputText id="email" [(ngModel)]="currentClient.email" class="w-full" type="email" required />
        </div>
        <div class="form-field">
          <label for="phone">Phone</label>
          <input pInputText id="phone" [(ngModel)]="currentClient.phone" class="w-full" />
        </div>
        <div class="form-field">
          <label for="address">Address</label>
          <textarea pTextarea id="address" [(ngModel)]="currentClient.address" class="w-full" rows="3"></textarea>
        </div>
        <div class="dialog-footer">
          <p-button label="Cancel" [text]="true" (onClick)="dialogVisible = false"></p-button>
          <p-button label="Save" (onClick)="saveClient()" [disabled]="!currentClient.clientName || !currentClient.email"></p-button>
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

  constructor(
    private api: ApiService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.loading = true;
    this.api.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load clients' });
        this.loading = false;
      }
    });
  }

  openDialog() {
    this.currentClient = {};
    this.editMode = false;
    this.dialogVisible = true;
  }

  editClient(client: Client) {
    this.currentClient = { ...client };
    this.editMode = true;
    this.dialogVisible = true;
  }

  saveClient() {
    if (this.editMode && this.currentClient.id) {
      this.api.updateClient(this.currentClient.id, this.currentClient).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Client updated' });
          this.loadClients();
          this.dialogVisible = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update client' });
        }
      });
    } else {
      this.api.createClient(this.currentClient).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Client created' });
          this.loadClients();
          this.dialogVisible = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create client' });
        }
      });
    }
  }

  confirmDelete(client: Client) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${client.clientName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteClient(client.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Client deleted' });
            this.loadClients();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete client' });
          }
        });
      }
    });
  }
}
