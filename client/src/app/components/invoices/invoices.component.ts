import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { ConfirmSaveService } from '../../shared/confirm-save.service';
import { Invoice, Client, Project } from '../../models/models';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    DialogModule, SelectModule, DatePickerModule, 
    ConfirmDialogModule, ToastModule
  ],
  templateUrl: './invoices.component.html'
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  clients: Client[] = [];
  projects: Project[] = [];
  loading = false;
  submitted = false;
  
  generateDialogVisible = false;
  viewDialogVisible = false;
  selectedInvoice: Invoice | null = null;
  
  generateData: any = {};
  dateFromObj: Date | null = null;
  dateToObj: Date | null = null;
  
  clientOptions: { label: string; value: number }[] = [];
  clientProjectOptions: { label: string; value: number }[] = [];

  constructor(
    private api: ApiService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private confirmSaveService: ConfirmSaveService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.cdr.detectChanges();
    this.api.getInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load invoices' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    
    this.api.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.clientOptions = data.map(c => ({ label: c.clientName, value: c.id }));
      }
    });
    
    this.api.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
      }
    });
  }

  formatStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'draft': 'bg-secondary',
      'sent': 'bg-info text-dark',
      'paid': 'bg-success',
      'overdue': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  openGenerateDialog() {
    this.generateData = {};
    this.dateFromObj = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    this.dateToObj = new Date();
    this.clientProjectOptions = [];
    this.submitted = false;
    this.generateDialogVisible = true;
  }

  onClientChange() {
    if (this.generateData.clientId) {
      this.clientProjectOptions = this.projects
        .filter(p => p.clientId === this.generateData.clientId)
        .map(p => ({ label: p.projectName, value: p.id }));
    } else {
      this.clientProjectOptions = [];
    }
    this.generateData.projectId = null;
  }

  isGenerateValid(): boolean {
    return this.generateData.clientId && this.dateFromObj && this.dateToObj;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async generateInvoice() {
    this.submitted = true;
    if (!this.isGenerateValid()) return;

    const confirmed = await this.confirmSaveService.confirmAction('Are you sure you want to generate this invoice?', 'Confirm Generate');
    if (!confirmed) return;

    const data = {
      clientId: this.generateData.clientId,
      projectId: this.generateData.projectId || undefined,
      dateFrom: this.formatDate(this.dateFromObj!),
      dateTo: this.formatDate(this.dateToObj!)
    };
    
    this.api.generateInvoice(data).subscribe({
      next: (invoice) => {
        this.confirmSaveService.showSuccess('Invoice generated successfully');
        this.loadData();
        this.generateDialogVisible = false;
        this.selectedInvoice = invoice;
        this.viewDialogVisible = true;
      },
      error: (err) => {
        this.confirmSaveService.showError(err.error?.error || 'Failed to generate invoice');
      }
    });
  }

  viewInvoice(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.viewDialogVisible = true;
  }

  markAsPaid(invoice: Invoice) {
    this.api.updateInvoiceStatus(invoice.id, 'paid').subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Invoice marked as paid' });
        this.loadData();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update invoice status' });
      }
    });
  }

  downloadPdf(invoice: Invoice) {
    const doc = new jsPDF();
    
    doc.setFontSize(24);
    doc.text('INVOICE', 20, 25);
    
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 40);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 47);
    doc.text(`Period: ${new Date(invoice.dateFrom).toLocaleDateString()} - ${new Date(invoice.dateTo).toLocaleDateString()}`, 20, 54);
    
    doc.text('Bill To:', 120, 40);
    doc.text(invoice.client?.clientName || '', 120, 47);
    doc.text(invoice.client?.email || '', 120, 54);
    if (invoice.client?.address) {
      doc.text(invoice.client.address, 120, 61);
    }
    
    if (invoice.project) {
      doc.text(`Project: ${invoice.project.projectName}`, 20, 65);
    }
    
    const tableData = invoice.lineItems?.map(item => [
      item.description,
      item.quantity,
      `$${parseFloat(item.rate).toFixed(2)}`,
      `$${parseFloat(item.amount).toFixed(2)}`
    ]) || [];
    
    autoTable(doc, {
      startY: 75,
      head: [['Description', 'Quantity', 'Rate', 'Amount']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 95] },
      foot: [
        ['', '', 'Subtotal:', `$${parseFloat(invoice.subtotal).toFixed(2)}`],
        ['', '', 'Tax:', `$${parseFloat(invoice.tax).toFixed(2)}`],
        ['', '', 'Total:', `$${parseFloat(invoice.total).toFixed(2)}`]
      ],
      footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' }
    });
    
    doc.save(`${invoice.invoiceNumber}.pdf`);
  }

  confirmDelete(invoice: Invoice) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete invoice "${invoice.invoiceNumber}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteInvoice(invoice.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Invoice deleted' });
            this.loadData();
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete invoice' });
          }
        });
      }
    });
  }
}
