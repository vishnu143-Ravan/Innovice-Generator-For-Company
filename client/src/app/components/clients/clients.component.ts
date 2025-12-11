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
  templateUrl: './clients.component.html'
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
