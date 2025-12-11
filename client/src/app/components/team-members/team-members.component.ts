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
import { TeamMember } from '../../models/models';

@Component({
  selector: 'app-team-members',
  standalone: true,
  imports: [
    CommonModule, RouterLink, TableModule, ButtonModule,
    ConfirmDialogModule, ToastModule
  ],
  templateUrl: './team-members.component.html'
})
export class TeamMembersComponent implements OnInit {
  teamMembers: TeamMember[] = [];
  loading = true;

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private confirmSaveService: ConfirmSaveService,
    private cdr: ChangeDetectorRef,
    public t: TranslateService
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
