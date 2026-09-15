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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-neutral-900">Sections</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (window.confirm("Clear everything in the editor? This can't be undone.")) {
              resetCV();
            }
          }}
        >
          Start over
        </Button>
      </div>

      <Accordion>
        <AccordionItem title="Personal details" defaultOpen>
          <PersonalInfoForm />
        </AccordionItem>

        <AccordionItem title="Work experience">
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

        <AccordionItem title="Layout and style">
          <StyleForm />
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default EditorSidebar;
