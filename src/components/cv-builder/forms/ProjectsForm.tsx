import React from 'react';
import { useCVStore, type Project } from '../../../stores/cvStore';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Trash2, Plus } from 'lucide-react';

const ProjectsForm: React.FC = () => {
  const { data, addProject, updateProject, removeProject } = useCVStore();

  const handleChange = (id: string, field: keyof Project, value: any) => {
    updateProject(id, { [field]: value });
  };

  const handleTechChange = (id: string, value: string) => {
    // Split by comma and trim
    const techs = value.split(',').map(t => t.trim()).filter(Boolean);
    updateProject(id, { technologies: techs });
  };

  return (
    <div className="space-y-6">
      {data.projects.map((project) => (
        <div key={project.id} className="p-4 border rounded-lg bg-gray-50 space-y-4 relative group">
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeProject(project.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input
              value={project.name}
              onChange={(e) => handleChange(project.id, 'name', e.target.value)}
              placeholder="Project Name"
            />
          </div>

          <div className="space-y-2">
            <Label>Project URL</Label>
            <Input
              value={project.url}
              onChange={(e) => handleChange(project.id, 'url', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>Technologies (comma separated)</Label>
            <Input
              defaultValue={project.technologies.join(', ')}
              onBlur={(e) => handleTechChange(project.id, e.target.value)}
              placeholder="React, Node.js, TypeScript"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={project.description}
              onChange={(e) => handleChange(project.id, 'description', e.target.value)}
              placeholder="Describe the project..."
              rows={3}
            />
          </div>
        </div>
      ))}

      <Button onClick={addProject} className="w-full" variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        Add Project
      </Button>
    </div>
  );
};

export default ProjectsForm;
