import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Copy, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { ProjectService, type Project, type ProjectType } from '@/services/projectService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectManagerProps {
  projectType: ProjectType;
  currentProject: any;
  onLoad: (project: Project) => void;
  onSave?: () => Project;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projectType,
  currentProject,
  onLoad,
  onSave,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (loadDialogOpen && isAuthenticated) {
      loadProjects();
    }
  }, [loadDialogOpen, isAuthenticated]);

  const checkAuthentication = async () => {
    const authenticated = await ProjectService.isAuthenticated();
    setIsAuthenticated(authenticated);
  };

  const loadProjects = async () => {
    setLoading(true);
    const loadedProjects = await ProjectService.getAllProjects(projectType);
    setProjects(loadedProjects);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    if (!onSave) {
      toast.error('Save function not configured');
      return;
    }

    setLoading(true);

    const projectData = onSave();
    const result = await ProjectService.saveProject({
      name: projectName,
      type: projectType,
      data: projectData,
    });

    setLoading(false);

    if (result.success) {
      toast.success(`Project "${projectName}" saved successfully`);
      setSaveDialogOpen(false);
      setProjectName('');
    }
  };

  const handleLoad = async () => {
    if (!selectedProjectId) {
      toast.error('Please select a project');
      return;
    }

    setLoading(true);
    const project = await ProjectService.loadProject(selectedProjectId);
    setLoading(false);

    if (project) {
      onLoad(project);
      toast.success(`Project "${project.name}" loaded successfully`);
      setLoadDialogOpen(false);
      setSelectedProjectId('');
    }
  };

  const handleDelete = async (projectId: string, projectName: string) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"?`)) {
      return;
    }

    setLoading(true);
    const success = await ProjectService.deleteProject(projectId);
    setLoading(false);

    if (success) {
      toast.success(`Project "${projectName}" deleted`);
      loadProjects(); // Refresh list
    }
  };

  const handleDuplicate = async (projectId: string, projectName: string) => {
    const newName = prompt(`Enter name for duplicate of "${projectName}":`, `${projectName} (Copy)`);

    if (!newName) return;

    setLoading(true);
    const result = await ProjectService.duplicateProject(projectId, newName);
    setLoading(false);

    if (result.success) {
      toast.success(`Project duplicated as "${newName}"`);
      loadProjects(); // Refresh list
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CloudOff className="h-4 w-4" />
        <span>Sign in to save/load projects</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Save Project Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription>
              Save your current {projectType.replace('_', ' ')} to the cloud
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Project Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="h-4 w-4 mr-2" />
            Load Project
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Project</DialogTitle>
            <DialogDescription>
              Select a saved project to load
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="grid gap-3">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading projects...</p>
              ) : projects.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No saved projects found</p>
              ) : (
                projects.map((project) => (
                  <Card
                    key={project.id}
                    className={`cursor-pointer hover:bg-accent transition-colors ${
                      selectedProjectId === project.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedProjectId(project.id!)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{project.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            Updated: {new Date(project.updated_at!).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(project.id!, project.name);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(project.id!, project.name);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLoad} disabled={!selectedProjectId || loading}>
              {loading ? 'Loading...' : 'Load Selected'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Badge variant="outline" className="flex items-center gap-1">
        <Cloud className="h-3 w-3" />
        Connected
      </Badge>
    </div>
  );
};
