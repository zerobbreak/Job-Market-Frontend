import React from 'react';
import { useCVStore, type Skill } from '../../../stores/cvStore';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Trash2, Plus } from 'lucide-react';

const SkillsForm: React.FC = () => {
  const { data, addSkill, updateSkill, removeSkill } = useCVStore();

  const handleChange = (id: string, field: keyof Skill, value: any) => {
    updateSkill(id, { [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {data.skills.map((skill) => (
          <div key={skill.id} className="flex gap-2 items-center">
            <Input
              value={skill.name}
              onChange={(e) => handleChange(skill.id, 'name', e.target.value)}
              placeholder="Skill (e.g. React)"
              className="flex-1"
            />
            <Input
              value={skill.years || ''}
              onChange={(e) => handleChange(skill.id, 'years', e.target.value)}
              placeholder="Years"
              className="w-[80px]"
            />
            <Select
              value={skill.level}
              onValueChange={(value) => handleChange(skill.id, 'level', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeSkill(skill.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={addSkill} className="w-full" variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        Add Skill
      </Button>
    </div>
  );
};

export default SkillsForm;
