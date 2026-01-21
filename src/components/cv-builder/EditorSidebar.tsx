import React from 'react';
import { Accordion, AccordionItem } from '../ui/accordion';
import PersonalInfoForm from './forms/PersonalInfoForm';
import ExperienceForm from './forms/ExperienceForm';
import EducationForm from './forms/EducationForm';
import SkillsForm from './forms/SkillsForm';
import ProjectsForm from './forms/ProjectsForm';
import StyleForm from './forms/StyleForm';
import { Button } from '../ui/button';
import { useCVStore } from '../../stores/cvStore';

const EditorSidebar: React.FC = () => {
  const { resetCV } = useCVStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">CV Editor</h2>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => {
              if (window.confirm('Are you sure you want to reset all data?')) {
                resetCV();
              }
           }}>
             Reset
           </Button>
        </div>
      </div>

      <Accordion>
        <AccordionItem title="Personal Information" defaultOpen>
          <PersonalInfoForm />
        </AccordionItem>
        
        <AccordionItem title="Work Experience">
          <ExperienceForm />
        </AccordionItem>
        
        <AccordionItem title="Education">
          <EducationForm />
        </AccordionItem>
        
        <AccordionItem title="Skills">
          <SkillsForm />
        </AccordionItem>

        <AccordionItem title="Projects">
          <ProjectsForm />
        </AccordionItem>
        
        <AccordionItem title="Appearance & Style">
          <StyleForm />
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default EditorSidebar;
