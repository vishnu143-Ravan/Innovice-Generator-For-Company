import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../services/api.service';
import { ConfirmSaveService } from '../../shared/confirm-save.service';
import { TranslateService } from '../../shared/translate.service';
import { Project } from '../../models/models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule, RouterLink, TableModule, ButtonModule,
    ConfirmDialogModule, ToastModule, TagModule
  ],
  templateUrl: './projects.component.html'
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  loading = true;

  constructor(
    private api: ApiService,
    private messageService: MessageService,
    private confirmSaveService: ConfirmSaveService,
    private cdr: ChangeDetectorRef,
    public t: TranslateService
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.cdr.detectChanges();
    this.api.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load projects' });
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'pending': 'bg-warning text-dark',
      'in_progress': 'bg-info text-dark',
      'completed': 'bg-success',
      'on_hold': 'bg-secondary',
      'cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  async confirmDelete(project: Project) {
    const confirmed = await this.confirmSaveService.confirmDelete('project', project.projectName);
    if (!confirmed) return;

    this.api.deleteProject(project.id).subscribe({
      next: () => {
        this.confirmSaveService.showSuccess('Project deleted');
        this.loadProjects();
      },
      error: () => {
        this.confirmSaveService.showError('Failed to delete project');
      }
    });
  }
}
