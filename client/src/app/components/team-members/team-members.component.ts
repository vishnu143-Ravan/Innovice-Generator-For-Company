import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { ConfirmSaveService } from '../../shared/confirm-save.service';
import { TeamMember } from '../../models/models';

@Component({
  selector: 'app-team-members',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule,
    DialogModule, InputTextModule, InputNumberModule, SelectModule,
    ConfirmDialogModule, ToastModule
  ],
  templateUrl: './team-members.component.html'
})
export class TeamMembersComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  loading = false;
  dialogVisible = false;
  editMode = false;
  currentMember: any = {};
  submitted = false;
  
  billingTypes = [
    { label: 'Hourly', value: 'hourly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  constructor(
    private api: ApiService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private confirmSaveService: ConfirmSaveService
  ) {}

  ngOnInit() {
    this.loadMembers();
  }

  loadMembers() {
    this.loading = true;
    this.cdr.detectChanges();
    this.api.getTeamMembers().subscribe({
      next: (data) => {
        this.teamMembers = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load team members' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openDialog() {
    this.currentMember = { billingType: 'hourly' };
    this.editMode = false;
    this.submitted = false;
    this.dialogVisible = true;
  }

  editMember(member: TeamMember) {
    this.currentMember = { ...member, rate: parseFloat(member.rate) };
    this.editMode = true;
    this.submitted = false;
    this.dialogVisible = true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValid(): boolean {
    return this.currentMember.name && this.currentMember.email && 
           this.isValidEmail(this.currentMember.email) &&
           this.currentMember.role && this.currentMember.billingType && this.currentMember.rate;
  }

  async saveMember() {
    this.submitted = true;
    if (!this.isValid()) return;

    const confirmed = await this.confirmSaveService.confirmSave('team member');
    if (!confirmed) return;

    const data = { ...this.currentMember, rate: String(this.currentMember.rate) };
    
    if (this.editMode && this.currentMember.id) {
      this.api.updateTeamMember(this.currentMember.id, data).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Team member updated successfully');
          this.loadMembers();
          this.dialogVisible = false;
        },
        error: () => {
          this.confirmSaveService.showError('Failed to update team member');
        }
      });
    } else {
      this.api.createTeamMember(data).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Team member created successfully');
          this.loadMembers();
          this.dialogVisible = false;
        },
        error: () => {
          this.confirmSaveService.showError('Failed to create team member');
        }
      });
    }
  }

  async confirmDelete(member: TeamMember) {
    const confirmed = await this.confirmSaveService.confirmDelete('team member', member.name);
    if (!confirmed) return;

    this.api.deleteTeamMember(member.id).subscribe({
      next: () => {
        this.confirmSaveService.showSuccess('Team member deleted');
        this.loadMembers();
      },
      error: () => {
        this.confirmSaveService.showError('Failed to delete team member');
      }
    });
  }
}
