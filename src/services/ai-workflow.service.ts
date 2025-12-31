import { Injectable, inject, computed } from '@angular/core';
import { StorageService } from './storage.service';

export interface WorkflowSuggestion {
  title: string;
  prompt: string;
  icon: string;
  category: 'create' | 'manage' | 'optimize' | 'analyze';
  condition?: () => boolean;
}

/**
 * AI Workflow Assistant Service
 * Provides intelligent suggestions based on current app state
 */
@Injectable({
  providedIn: 'root'
})
export class AiWorkflowService {
  private storage = inject(StorageService);

  // Dynamic workflow suggestions based on app state
  suggestions = computed<WorkflowSuggestion[]>(() => {
    const projects = this.storage.projects();
    const currentProject = this.storage.activeProject();
    const suggestions: WorkflowSuggestion[] = [];

    // No projects yet - suggest getting started
    if (projects.length === 0) {
      suggestions.push({
        title: 'Create Your First Campaign',
        prompt: 'Create a campaign for [brand name], a [product description] targeting [audience]',
        icon: '🚀',
        category: 'create'
      });
    }

    // Has projects in draft - suggest ideation
    const draftProjects = projects.filter(p => p.status === 'draft');
    if (draftProjects.length > 0) {
      suggestions.push({
        title: 'Generate Creative Concepts',
        prompt: `Generate 5 creative concepts for ${draftProjects[0].name}`,
        icon: '💡',
        category: 'create'
      });
    }

    // Has projects with concepts but no selection
    const ideationProjects = projects.filter(p => 
      p.status === 'ideation' && 
      p.ideationConcepts.length > 0 && 
      p.ideationConcepts.filter(c => c.isSelected).length === 0
    );
    if (ideationProjects.length > 0) {
      suggestions.push({
        title: 'Select Best Concepts',
        prompt: `Review concepts for ${ideationProjects[0].name} and select the top 2`,
        icon: '⭐',
        category: 'manage'
      });
    }

    // Has selected concepts but no finals
    const readyForProduction = projects.filter(p => 
      p.ideationConcepts.some(c => c.isSelected) && 
      p.finalAds.length === 0
    );
    if (readyForProduction.length > 0) {
      suggestions.push({
        title: 'Generate Final Ads',
        prompt: `Generate final ads for ${readyForProduction[0].name}`,
        icon: '📝',
        category: 'create'
      });
    }

    // Has finals but no images
    const needsImages = projects.filter(p => 
      p.finalAds.length > 0 && 
      p.finalAds.some(ad => !ad.imageUrl)
    );
    if (needsImages.length > 0) {
      suggestions.push({
        title: 'Generate Ad Images',
        prompt: `Generate images for all ads in ${needsImages[0].name}`,
        icon: '🎨',
        category: 'create'
      });
    }

    // Has completed ads but not scheduled
    const needsScheduling = projects.filter(p => 
      p.finalAds.length > 0 && 
      p.finalAds.every(ad => ad.imageUrl) && 
      !p.finalAds.some(ad => ad.scheduledTime)
    );
    if (needsScheduling.length > 0) {
      suggestions.push({
        title: 'Schedule Campaign',
        prompt: `Schedule ${needsScheduling[0].name} to launch next Monday at 9 AM`,
        icon: '📅',
        category: 'manage'
      });
    }

    // Has completed projects - suggest optimization
    const completedProjects = projects.filter(p => p.status === 'completed');
    if (completedProjects.length > 0) {
      suggestions.push({
        title: 'Generate SEO Report',
        prompt: `Generate SEO report for ${completedProjects[0].name}`,
        icon: '📊',
        category: 'analyze'
      });
    }

    // Always available: End-to-end automation
    suggestions.push({
      title: 'Full Campaign Automation',
      prompt: 'Create a complete campaign from scratch: analyze brand, generate 5 concepts, select best ones, create finals with images, and schedule for next week',
      icon: '🤖',
      category: 'create'
    });

    // List all campaigns
    if (projects.length > 0) {
      suggestions.push({
        title: 'Review All Campaigns',
        prompt: 'List all my campaigns with their current status and next recommended actions',
        icon: '📋',
        category: 'manage'
      });
    }

    return suggestions;
  });

  // Get context about current state for AI
  getContextSummary(): string {
    const projects = this.storage.projects();
    const currentProject = this.storage.activeProject();

    const summary = [];

    summary.push(`Total Projects: ${projects.length}`);

    if (projects.length > 0) {
      const byStatus = {
        draft: projects.filter(p => p.status === 'draft').length,
        ideation: projects.filter(p => p.status === 'ideation').length,
        production: projects.filter(p => p.status === 'production').length,
        completed: projects.filter(p => p.status === 'completed').length
      };
      
      summary.push(`Status Breakdown: ${JSON.stringify(byStatus)}`);
    }

    if (currentProject) {
      summary.push(`Current Project: ${currentProject.name} (${currentProject.status})`);
      summary.push(`Concepts: ${currentProject.ideationConcepts.length}, Selected: ${currentProject.ideationConcepts.filter(c => c.isSelected).length}`);
      summary.push(`Final Ads: ${currentProject.finalAds.length}`);
    }

    return summary.join('\n');
  }

  // Get recommended next action
  getRecommendedAction(): string | null {
    const suggestions = this.suggestions();
    if (suggestions.length > 0) {
      return suggestions[0].prompt;
    }
    return null;
  }

  // Predefined workflow templates
  getWorkflowTemplates(): Array<{ name: string; steps: string[] }> {
    return [
      {
        name: 'Quick Campaign',
        steps: [
          'Create project with brand details',
          'Generate 3 concepts',
          'Select best concept',
          'Generate finals',
          'Create images',
          'Schedule for tomorrow'
        ]
      },
      {
        name: 'Full Campaign with Analysis',
        steps: [
          'Analyze brand website',
          'Create project from analysis',
          'Generate 8 concepts',
          'Select top 3 concepts',
          'Generate finals with A/B variants',
          'Create images for all ads',
          'Generate SEO report',
          'Schedule campaign'
        ]
      },
      {
        name: 'Social Media Blitz',
        steps: [
          'Create project',
          'Generate 10 concepts',
          'Select 5 concepts',
          'Generate finals for each platform',
          'Create images',
          'Schedule across all platforms'
        ]
      }
    ];
  }
}
