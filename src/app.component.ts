import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard.component';
import { ProjectDetailComponent } from './components/project-detail.component';
import { SetupFormComponent } from './components/setup-form.component';
import { IntegrationWizardComponent } from './components/integration-wizard.component';
import { AiAssistantComponent } from './components/ai-assistant.component';
import { LanguageSwitcherComponent } from './components/language-switcher.component';
import { ToastNotificationsComponent } from './components/toast-notifications.component';
import { SettingsMenuComponent } from './components/settings-menu.component';
import { StorageService, ProjectParams } from './services/storage.service';
import { I18nService } from './services/i18n.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DashboardComponent, ProjectDetailComponent, SetupFormComponent, IntegrationWizardComponent, AiAssistantComponent, LanguageSwitcherComponent, ToastNotificationsComponent, SettingsMenuComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  storage = inject(StorageService);
  i18n = inject(I18nService);

  // We now read signals directly from storage which the AI can also manipulate
  currentView = this.storage.currentView;
  selectedProjectId = this.storage.selectedProjectId;
  
  isSidebarOpen = signal(false);

  // Sidebar Actions
  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  // Navigation Methods (Proxies to Storage)
  goToDashboard() {
    this.storage.setView('dashboard');
    this.closeSidebar();
  }

  goToCreate() {
    this.storage.setView('create');
    this.closeSidebar();
  }

  goToIntegrations() {
    this.storage.setView('integrations');
    this.closeSidebar();
  }

  openProject(id: string) {
    this.storage.openProject(id);
    this.closeSidebar();
  }

  handleCreateProject(params: ProjectParams) {
    const name = `${params.brandName} - ${params.industry}`;
    const project = this.storage.createProject(name, params);
    this.openProject(project.id);
  }
}
