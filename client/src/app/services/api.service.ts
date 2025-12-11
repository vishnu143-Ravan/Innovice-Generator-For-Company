import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, TeamMember, Project, TimeEntry, Invoice } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.baseUrl}/clients`);
  }

  getClient(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/clients/${id}`);
  }

  createClient(client: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(`${this.baseUrl}/clients`, client);
  }

  updateClient(id: number, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/clients/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clients/${id}`);
  }

  getTeamMembers(): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.baseUrl}/team-members`);
  }

  getTeamMember(id: number): Observable<TeamMember> {
    return this.http.get<TeamMember>(`${this.baseUrl}/team-members/${id}`);
  }

  createTeamMember(member: Partial<TeamMember>): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.baseUrl}/team-members`, member);
  }

  updateTeamMember(id: number, member: Partial<TeamMember>): Observable<TeamMember> {
    return this.http.put<TeamMember>(`${this.baseUrl}/team-members/${id}`, member);
  }

  deleteTeamMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/team-members/${id}`);
  }

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects`);
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/projects/${id}`);
  }

  getProjectsByClient(clientId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects/by-client/${clientId}`);
  }

  createProject(project: Partial<Project> & { teamMemberIds?: number[] }): Observable<Project> {
    return this.http.post<Project>(`${this.baseUrl}/projects`, project);
  }

  updateProject(id: number, project: Partial<Project> & { teamMemberIds?: number[] }): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/projects/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/projects/${id}`);
  }

  getTimeEntry(id: number): Observable<TimeEntry> {
    return this.http.get<TimeEntry>(`${this.baseUrl}/time-entries/${id}`);
  }

  getTimeEntries(filters?: { projectId?: number; teamMemberId?: number; dateFrom?: string; dateTo?: string }): Observable<TimeEntry[]> {
    let params: any = {};
    if (filters) {
      if (filters.projectId) params.projectId = filters.projectId;
      if (filters.teamMemberId) params.teamMemberId = filters.teamMemberId;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
    }
    return this.http.get<TimeEntry[]>(`${this.baseUrl}/time-entries`, { params });
  }

  createTimeEntry(entry: Partial<TimeEntry>): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(`${this.baseUrl}/time-entries`, entry);
  }

  updateTimeEntry(id: number, entry: Partial<TimeEntry>): Observable<TimeEntry> {
    return this.http.put<TimeEntry>(`${this.baseUrl}/time-entries/${id}`, entry);
  }

  deleteTimeEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/time-entries/${id}`);
  }

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.baseUrl}/invoices`);
  }

  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.baseUrl}/invoices/${id}`);
  }

  generateInvoice(data: { clientId: number; projectId?: number; dateFrom: string; dateTo: string }): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.baseUrl}/invoices/generate`, data);
  }

  updateInvoiceStatus(id: number, status: string): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.baseUrl}/invoices/${id}/status`, { status });
  }

  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/invoices/${id}`);
  }
}
