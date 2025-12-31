import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { ErrorHandlerService } from './error-handler.service';
import { I18nService } from './i18n.service';

export interface ExportData {
  version: string;
  exportDate: string;
  projects: any[];
  integrations: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DataBackupService {
  private storage = inject(StorageService);
  private errorHandler = inject(ErrorHandlerService);
  private i18n = inject(I18nService);

  /**
   * Export all data to JSON file
   */
  exportData() {
    try {
      const data: ExportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        projects: this.storage.projects(),
        integrations: this.storage.integrations()
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `adopt-backup-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.errorHandler.showSuccess('Data exported successfully');
    } catch (error) {
      this.errorHandler.showError('Failed to export data');
      console.error('Export error:', error);
    }
  }

  /**
   * Import data from JSON file
   */
  async importData(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const data: ExportData = JSON.parse(text);

      // Validate data structure
      if (!data.version || !data.projects || !data.integrations) {
        throw new Error('Invalid backup file format');
      }

      // Show confirmation dialog
      const confirm = window.confirm(
        `Import ${data.projects.length} projects from backup dated ${new Date(data.exportDate).toLocaleString()}?\n\nThis will replace your current data.`
      );

      if (!confirm) {
        return false;
      }

      // Import projects
      for (const project of data.projects) {
        // Ensure project has required fields
        if (project.id && project.name && project.params) {
          this.storage.projects.update(list => {
            // Remove existing project with same ID
            const filtered = list.filter(p => p.id !== project.id);
            return [project, ...filtered];
          });
        }
      }

      // Save to localStorage
      localStorage.setItem('adscale_projects_v2', JSON.stringify(this.storage.projects()));

      this.errorHandler.showSuccess(`Imported ${data.projects.length} projects successfully`);
      return true;
    } catch (error: any) {
      this.errorHandler.showError(`Import failed: ${error.message}`);
      console.error('Import error:', error);
      return false;
    }
  }

  /**
   * Create automatic backup to localStorage
   */
  createAutoBackup() {
    try {
      const data: ExportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        projects: this.storage.projects(),
        integrations: this.storage.integrations()
      };

      localStorage.setItem('adscale_auto_backup', JSON.stringify(data));
      localStorage.setItem('adscale_last_backup', Date.now().toString());
    } catch (error) {
      console.error('Auto-backup error:', error);
    }
  }

  /**
   * Restore from automatic backup
   */
  restoreAutoBackup(): boolean {
    try {
      const backupData = localStorage.getItem('adscale_auto_backup');
      if (!backupData) {
        this.errorHandler.showWarning('No automatic backup found');
        return false;
      }

      const data: ExportData = JSON.parse(backupData);
      const lastBackup = localStorage.getItem('adscale_last_backup');
      const backupDate = lastBackup ? new Date(parseInt(lastBackup)) : new Date(data.exportDate);

      const confirm = window.confirm(
        `Restore from automatic backup dated ${backupDate.toLocaleString()}?\n\nThis will replace your current data.`
      );

      if (!confirm) {
        return false;
      }

      // Restore projects
      this.storage.projects.set(data.projects);
      localStorage.setItem('adscale_projects_v2', JSON.stringify(data.projects));

      this.errorHandler.showSuccess('Data restored from backup');
      return true;
    } catch (error: any) {
      this.errorHandler.showError(`Restore failed: ${error.message}`);
      console.error('Restore error:', error);
      return false;
    }
  }

  /**
   * Get last backup date
   */
  getLastBackupDate(): Date | null {
    const timestamp = localStorage.getItem('adscale_last_backup');
    return timestamp ? new Date(parseInt(timestamp)) : null;
  }

  /**
   * Clear all data (with confirmation)
   */
  clearAllData(): boolean {
    const confirm = window.confirm(
      'Are you sure you want to delete ALL data?\n\nThis action cannot be undone. Consider exporting a backup first.'
    );

    if (!confirm) {
      return false;
    }

    const doubleConfirm = window.confirm(
      'This is your last warning. All projects and integrations will be permanently deleted.\n\nContinue?'
    );

    if (!doubleConfirm) {
      return false;
    }

    try {
      localStorage.removeItem('adscale_projects_v2');
      localStorage.removeItem('adscale_integrations_v2');
      this.storage.projects.set([]);
      this.storage.integrations.set([]);
      
      this.errorHandler.showInfo('All data cleared');
      return true;
    } catch (error) {
      this.errorHandler.showError('Failed to clear data');
      return false;
    }
  }
}
