import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../services/api.service';
import { ConfirmSaveService } from '../../../shared/confirm-save.service';
import { TranslateService } from '../../../shared/translate.service';

@Component({
  selector: 'app-team-member-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule,
    InputNumberModule, SelectModule, ToastModule, ConfirmDialogModule
  ],
  templateUrl: './team-member-form.component.html'
})
export class TeamMemberFormComponent implements OnInit {
  editMode = false;
  memberId: number | null = null;
  currentMember: any = { billingType: 'hourly' };
  submitted = false;
  loading = false;
  loadError = false;
  
  billingTypes: any[] = [];

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private confirmSaveService: ConfirmSaveService,
    public t: TranslateService
  ) {}

  ngOnInit() {
    this.updateBillingTypes();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode = true;
      this.memberId = parseInt(id);
      this.loadMember();
    }
  }

  updateBillingTypes() {
    this.billingTypes = [
      { label: this.t.get('teamMembers.hourly'), value: 'hourly' },
      { label: this.t.get('teamMembers.monthly'), value: 'monthly' }
    ];
  }

  loadMember() {
    if (!this.memberId) return;
    
    this.loading = true;
    this.api.getTeamMember(this.memberId).subscribe({
      next: (member) => {
        this.currentMember = { ...member, rate: parseFloat(member.rate) };
        this.loading = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load team member' });
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
    return this.currentMember.name && this.currentMember.email && 
           this.isValidEmail(this.currentMember.email) &&
           this.currentMember.role && this.currentMember.billingType && this.currentMember.rate;
  }

  async saveMember() {
    this.submitted = true;
    if (!this.isValid() || this.loadError) return;

    const confirmed = await this.confirmSaveService.confirmSave('team member');
    if (!confirmed) return;

    const data = { ...this.currentMember, rate: String(this.currentMember.rate) };
    
    if (this.editMode && this.memberId) {
      this.api.updateTeamMember(this.memberId, data).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Team member updated successfully');
          this.router.navigate(['/team-members']);
        },
        error: () => {
          this.confirmSaveService.showError('Failed to update team member');
        }
      });
    } else {
      this.api.createTeamMember(data).subscribe({
        next: () => {
          this.confirmSaveService.showSuccess('Team member created successfully');
          this.router.navigate(['/team-members']);
        },
        error: () => {
          this.confirmSaveService.showError('Failed to create team member');
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/team-members']);
  }
}
