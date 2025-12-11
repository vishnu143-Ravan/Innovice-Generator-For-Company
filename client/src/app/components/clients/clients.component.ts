import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { ConfirmSaveService } from '../../shared/confirm-save.service';
import { TranslateService } from '../../shared/translate.service';
import { Client } from '../../models/models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, RouterLink, TableModule, ButtonModule, 
    ConfirmDialogModule, ToastModule
  ],
  templateUrl: './clients.component.html'
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  loading = true;

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private confirmSaveService: ConfirmSaveService,
    private cdr: ChangeDetectorRef,
    public t: TranslateService
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
