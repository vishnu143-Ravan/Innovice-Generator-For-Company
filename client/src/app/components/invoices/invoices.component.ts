import { Component, OnInit } from '@angular/core';
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
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="container">
      <div class="page-header">
        <h2>Invoices</h2>
        <p-button icon="pi pi-plus" label="Generate Invoice" (onClick)="openGenerateDialog()"></p-button>
      </div>
      
      <div class="card">
        <p-table [value]="invoices" [paginator]="true" [rows]="10" [showCurrentPageReport]="true"
                 [rowsPerPageOptions]="[5,10,25,50]" dataKey="id" [loading]="loading"
                 currentPageReportTemplate="Showing {first} to {last} of {totalRecords} invoices">
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="invoiceNumber">Invoice # <p-sortIcon field="invoiceNumber"></p-sortIcon></th>
              <th>Client</th>
              <th>Project</th>
              <th>Period</th>
              <th pSortableColumn="total">Total <p-sortIcon field="total"></p-sortIcon></th>
              <th>Status</th>
              <th pSortableColumn="createdAt">Created <p-sortIcon field="createdAt"></p-sortIcon></th>
              <th style="width: 200px">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-invoice>
            <tr>
              <td>{{ invoice.invoiceNumber }}</td>
              <td>{{ invoice.client?.clientName || '-' }}</td>
              <td>{{ invoice.project?.projectName || 'All Projects' }}</td>
              <td>{{ invoice.dateFrom | date:'mediumDate' }} - {{ invoice.dateTo | date:'mediumDate' }}</td>
              <td>\${{ invoice.total | number:'1.2-2' }}</td>
              <td>
                <span class="status-badge" [class]="invoice.status">{{ formatStatus(invoice.status) }}</span>
              </td>
              <td>{{ invoice.createdAt | date:'mediumDate' }}</td>
              <td>
                <p-button icon="pi pi-eye" [rounded]="true" [text]="true" (onClick)="viewInvoice(invoice)" pTooltip="View"></p-button>
                <p-button icon="pi pi-download" [rounded]="true" [text]="true" (onClick)="downloadPdf(invoice)" pTooltip="Download PDF"></p-button>
                <p-button icon="pi pi-check" [rounded]="true" [text]="true" severity="success" (onClick)="markAsPaid(invoice)" 
                          *ngIf="invoice.status !== 'paid'" pTooltip="Mark as Paid"></p-button>
                <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="confirmDelete(invoice)" pTooltip="Delete"></p-button>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center">No invoices found. Click "Generate Invoice" to create one.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
      
      <p-dialog [(visible)]="generateDialogVisible" header="Generate Invoice" [modal]="true" [style]="{width: '500px'}">
        <div class="form-field">
          <label for="client">Client *</label>
          <p-select id="client" [(ngModel)]="generateData.clientId" [options]="clientOptions" 
                    optionLabel="label" optionValue="value" placeholder="Select client" 
                    class="w-full" (onChange)="onClientChange()"></p-select>
        </div>
        <div class="form-field">
          <label for="project">Project (optional)</label>
          <p-select id="project" [(ngModel)]="generateData.projectId" [options]="clientProjectOptions" 
                    optionLabel="label" optionValue="value" placeholder="All projects for this client" 
                    [showClear]="true" class="w-full"></p-select>
        </div>
        <div class="grid">
          <div class="col-6">
            <div class="form-field">
              <label for="dateFrom">From Date *</label>
              <p-datepicker id="dateFrom" [(ngModel)]="dateFromObj" dateFormat="yy-mm-dd" class="w-full"></p-datepicker>
            </div>
          </div>
          <div class="col-6">
            <div class="form-field">
              <label for="dateTo">To Date *</label>
              <p-datepicker id="dateTo" [(ngModel)]="dateToObj" dateFormat="yy-mm-dd" class="w-full"></p-datepicker>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <p-button label="Cancel" [text]="true" (onClick)="generateDialogVisible = false"></p-button>
          <p-button label="Generate" (onClick)="generateInvoice()" [disabled]="!isGenerateValid()"></p-button>
        </div>
      </p-dialog>
      
      <p-dialog [(visible)]="viewDialogVisible" [header]="'Invoice ' + (selectedInvoice?.invoiceNumber || '')" [modal]="true" [style]="{width: '700px'}">
        <div *ngIf="selectedInvoice" class="invoice-preview">
          <div class="invoice-header">
            <div>
              <h3>Invoice</h3>
              <p><strong>Invoice #:</strong> {{ selectedInvoice.invoiceNumber }}</p>
              <p><strong>Date:</strong> {{ selectedInvoice.createdAt | date:'mediumDate' }}</p>
            </div>
            <div class="text-right">
              <p><strong>Bill To:</strong></p>
              <p>{{ selectedInvoice.client?.clientName }}</p>
              <p>{{ selectedInvoice.client?.email }}</p>
              <p>{{ selectedInvoice.client?.address || '' }}</p>
            </div>
          </div>
          
          <p><strong>Period:</strong> {{ selectedInvoice.dateFrom | date:'mediumDate' }} - {{ selectedInvoice.dateTo | date:'mediumDate' }}</p>
          <p *ngIf="selectedInvoice.project"><strong>Project:</strong> {{ selectedInvoice.project.projectName }}</p>
          
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of selectedInvoice.lineItems">
                <td>{{ item.description }}</td>
                <td>{{ item.quantity }}</td>
                <td>\${{ item.rate | number:'1.2-2' }}</td>
                <td>\${{ item.amount | number:'1.2-2' }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
                <td>\${{ selectedInvoice.subtotal | number:'1.2-2' }}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right"><strong>Tax:</strong></td>
                <td>\${{ selectedInvoice.tax | number:'1.2-2' }}</td>
              </tr>
              <tr>
                <td colspan="3" class="text-right"><strong>Total:</strong></td>
                <td><strong>\${{ selectedInvoice.total | number:'1.2-2' }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div class="dialog-footer">
          <p-button label="Close" [text]="true" (onClick)="viewDialogVisible = false"></p-button>
          <p-button label="Download PDF" icon="pi pi-download" (onClick)="downloadPdf(selectedInvoice!)"></p-button>
        </div>
      </p-dialog>
      
      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .invoice-preview {
      padding: 1rem;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #ddd;
    }
    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      
      th, td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      th {
        background: #f8f9fa;
        font-weight: 600;
      }
      tfoot td {
        border-bottom: none;
        padding: 0.5rem 0.75rem;
      }
    }
    .text-right {
      text-align: right;
    }
  `]
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  clients: Client[] = [];
  projects: Project[] = [];
  loading = false;
  
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
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.api.getInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load invoices' });
        this.loading = false;
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

  openGenerateDialog() {
    this.generateData = {};
    this.dateFromObj = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    this.dateToObj = new Date();
    this.clientProjectOptions = [];
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

  generateInvoice() {
    const data = {
      clientId: this.generateData.clientId,
      projectId: this.generateData.projectId || undefined,
      dateFrom: this.formatDate(this.dateFromObj!),
      dateTo: this.formatDate(this.dateToObj!)
    };
    
    this.api.generateInvoice(data).subscribe({
      next: (invoice) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Invoice generated successfully' });
        this.loadData();
        this.generateDialogVisible = false;
        this.selectedInvoice = invoice;
        this.viewDialogVisible = true;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Failed to generate invoice' });
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
