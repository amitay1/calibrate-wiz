import { supabase } from '@/integrations/supabase/client';
import { ErrorHandler, AppError, ErrorType } from '@/utils/errorHandling';
import type { TechniqueSheet } from '@/types/techniqueSheet';
import type { InspectionReportData } from '@/types/inspectionReport';

/**
 * Project types
 */
export type ProjectType = 'technique_sheet' | 'inspection_report';

export interface Project {
  id?: string;
  user_id?: string;
  name: string;
  type: ProjectType;
  data: TechniqueSheet | InspectionReportData;
  created_at?: string;
  updated_at?: string;
}

/**
 * Project Service for Supabase integration
 * Handles saving, loading, and managing projects
 */
export class ProjectService {
  private static readonly TABLE_NAME = 'projects';

  /**
   * Save a project to Supabase
   */
  static async saveProject(project: Project): Promise<{ id: string; success: boolean }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new AppError(
          'You must be logged in to save projects',
          ErrorType.VALIDATION,
          'NOT_AUTHENTICATED'
        );
      }

      const projectData = {
        user_id: user.id,
        name: project.name,
        type: project.type,
        data: project.data,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (project.id) {
        // Update existing project
        result = await supabase
          .from(this.TABLE_NAME)
          .update(projectData)
          .eq('id', project.id)
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        // Create new project
        result = await supabase
          .from(this.TABLE_NAME)
          .insert({
            ...projectData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
      }

      if (result.error) {
        throw new AppError(
          `Failed to save project: ${result.error.message}`,
          ErrorType.NETWORK,
          'SUPABASE_ERROR'
        );
      }

      return { id: result.data.id, success: true };
    } catch (error) {
      ErrorHandler.handle(error as Error, 'ProjectService.saveProject');
      return { id: '', success: false };
    }
  }

  /**
   * Load a project from Supabase
   */
  static async loadProject(projectId: string): Promise<Project | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new AppError(
          'You must be logged in to load projects',
          ErrorType.VALIDATION,
          'NOT_AUTHENTICATED'
        );
      }

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw new AppError(
          `Failed to load project: ${error.message}`,
          ErrorType.NETWORK,
          'SUPABASE_ERROR'
        );
      }

      if (!data) {
        throw new AppError(
          'Project not found',
          ErrorType.VALIDATION,
          'NOT_FOUND'
        );
      }

      return data as Project;
    } catch (error) {
      ErrorHandler.handle(error as Error, 'ProjectService.loadProject');
      return null;
    }
  }

  /**
   * Get all projects for current user
   */
  static async getAllProjects(type?: ProjectType): Promise<Project[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Return empty array if not authenticated (no error)
        return [];
      }

      let query = supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        throw new AppError(
          `Failed to fetch projects: ${error.message}`,
          ErrorType.NETWORK,
          'SUPABASE_ERROR'
        );
      }

      return (data as Project[]) || [];
    } catch (error) {
      ErrorHandler.handle(error as Error, 'ProjectService.getAllProjects');
      return [];
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(projectId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new AppError(
          'You must be logged in to delete projects',
          ErrorType.VALIDATION,
          'NOT_AUTHENTICATED'
        );
      }

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) {
        throw new AppError(
          `Failed to delete project: ${error.message}`,
          ErrorType.NETWORK,
          'SUPABASE_ERROR'
        );
      }

      return true;
    } catch (error) {
      ErrorHandler.handle(error as Error, 'ProjectService.deleteProject');
      return false;
    }
  }

  /**
   * Duplicate a project
   */
  static async duplicateProject(projectId: string, newName: string): Promise<{ id: string; success: boolean }> {
    try {
      const project = await this.loadProject(projectId);

      if (!project) {
        throw new AppError(
          'Project not found',
          ErrorType.VALIDATION,
          'NOT_FOUND'
        );
      }

      // Create new project with duplicated data
      return await this.saveProject({
        name: newName,
        type: project.type,
        data: project.data,
      });
    } catch (error) {
      ErrorHandler.handle(error as Error, 'ProjectService.duplicateProject');
      return { id: '', success: false };
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      return null;
    }
  }
}
