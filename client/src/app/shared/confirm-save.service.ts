import { Injectable } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmSaveService {
  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  confirmSave(entityName: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message: `Are you sure you want to save this ${entityName}?`,
        header: 'Confirm Save',
        icon: 'pi pi-check-circle',
        accept: () => resolve(true),
        reject: () => resolve(false)
      });
    });
  }

  confirmDelete(entityName: string, itemName?: string): Promise<boolean> {
    const message = itemName 
      ? `Are you sure you want to delete "${itemName}"?`
      : `Are you sure you want to delete this ${entityName}?`;
    
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message,
        header: 'Confirm Delete',
        icon: 'pi pi-exclamation-triangle',
        accept: () => resolve(true),
        reject: () => resolve(false)
      });
    });
  }

  confirmAction(message: string, header: string = 'Confirm'): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        message,
        header,
        icon: 'pi pi-question-circle',
        accept: () => resolve(true),
        reject: () => resolve(false)
      });
    });
  }

  showSuccess(message: string, summary: string = 'Success') {
    this.messageService.add({ severity: 'success', summary, detail: message });
  }

  showError(message: string, summary: string = 'Error') {
    this.messageService.add({ severity: 'error', summary, detail: message });
  }

  showInfo(message: string, summary: string = 'Info') {
    this.messageService.add({ severity: 'info', summary, detail: message });
  }

  showWarning(message: string, summary: string = 'Warning') {
    this.messageService.add({ severity: 'warn', summary, detail: message });
  }
}
