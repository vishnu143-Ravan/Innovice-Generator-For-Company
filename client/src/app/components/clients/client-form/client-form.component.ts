import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../services/api.service';
import { ConfirmSaveService } from '../../../shared/confirm-save.service';
import { TranslateService } from '../../../shared/translate.service';
import { Client } from '../../../models/models';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule,
    TextareaModule, ToastModule, ConfirmDialogModule
  ],
  templateUrl: './client-form.component.html'
})
export class ClientFormComponent implements OnInit {
  editMode = false;
  clientId: number | null = null;
  currentClient: Partial<Client> = {};
  submitted = false;
  loading = false;
  loadError = false;

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
      this.clientId = parseInt(id);
      this.loadClient();
    }
  }

  loadClient() {
    if (!this.clientId) return;
    
    this.loading = true;
    this.api.getClient(this.clientId).subscribe({
      next: (client) => {
        this.currentClient = { ...client };
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load client' });
        this.loading = false;
        this.loadError = true;
      }
    });
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
    if (!this.isValid() || this.loadError) return;

    const confirmed = await this.confirmSaveService.confirmSave('client');
    if (!confirmed) return;

    if (this.editMode && this.clientId) {
      this.api.updateClient(this.clientId, this.currentClient).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Client updated successfully');
          this.router.navigate(['/clients']);
        },
        error: () => {
          this.confirmSaveService.showError('Failed to update client');
        }
      });
    } else {
      this.api.createClient(this.currentClient).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Client created successfully');
          this.router.navigate(['/clients']);
        },
        error: () => {
          this.confirmSaveService.showError('Failed to create client');
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/clients']);
  }
}
