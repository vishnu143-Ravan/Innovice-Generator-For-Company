export interface Client {
  id: number;
  clientName: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  billingType: 'hourly' | 'monthly';
  rate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  projectName: string;
  clientId: number;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  client?: Client;
  projectAssignments?: ProjectAssignment[];
}

export interface ProjectAssignment {
  id: number;
  projectId: number;
  teamMemberId: number;
  assignedAt: string;
  teamMember?: TeamMember;
}

export interface TimeEntry {
  id: number;
  projectId: number;
  teamMemberId: number;
  date: string;
  hours: string;
  description?: string;
  createdAt: string;
  project?: Project;
  teamMember?: TeamMember;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  projectId?: number;
  dateFrom: string;
  dateTo: string;
  subtotal: string;
  tax: string;
  total: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
  client?: Client;
  project?: Project;
  lineItems?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: number;
  invoiceId: number;
  description: string;
  quantity: string;
  rate: string;
  amount: string;
}
