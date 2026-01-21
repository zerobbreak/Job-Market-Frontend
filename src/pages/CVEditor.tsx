import React, { useEffect } from 'react';
import CVEditorLayout from '../components/cv-builder/CVEditorLayout';
import EditorSidebar from '../components/cv-builder/EditorSidebar';
import CVPreview from '../components/cv-builder/CVPreview';
import { useProfile } from '@/api/queries/useProfile';
import { useCVStore } from '@/stores/cvStore';
import { useToast } from '@/components/ui/toast';
import { Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const CVEditor: React.FC = () => {
  const { data: profile, isLoading } = useProfile();
  const { 
    data: cvData, 
    updatePersonalInfo, 
    setSkills, 
    setEducation, 
    setExperience, 
    setProjects 
  } = useCVStore();
  const { show: toast } = useToast();
  const [hasPopulated, setHasPopulated] = React.useState(false);

  const parseDateToMonth = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date.toISOString().slice(0, 7);
    }
    const months: {[key: string]: string} = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
        january: '01', february: '02', march: '03', april: '04', june: '06',
        july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
    };
    const parts = dateStr.toLowerCase().trim().split(/[\s-]+/);
    if (parts.length >= 2) {
        const month = months[parts[0].slice(0, 3)];
        const year = parts.find(p => p.match(/^\d{4}$/));
        if (month && year) return `${year}-${month}`;
    }
    return '';
  };

  useEffect(() => {
    // Only populate if we have profile data, we haven't populated yet, and the CV store is relatively empty
    // (e.g., name is empty or default). We don't want to overwrite user's work if they navigate away and back.
    if (profile && !hasPopulated && !cvData.personalInfo.fullName) {
      console.log('Populating CV from profile:', profile);
      const p = profile as any; // Cast to any to access new fields
      
      updatePersonalInfo({
        fullName: p.name || '',
        email: p.email || '',
        phone: p.phone || '',
        address: p.location || '',
        jobTitle: p.experience_level || 'Software Developer', // Fallback
        summary: p.career_goals || '',
        linkedin: p.links?.linkedin || '',
        github: p.links?.github || '',
        website: p.links?.portfolio || '',
      });

      // Populate skills
      if (p.skills && p.skills.length > 0 && cvData.skills.length === 0) {
        const newSkills = p.skills.map((skillName: string) => ({
            id: uuidv4(),
            name: skillName,
            level: 'Intermediate' as const
        }));
        setSkills(newSkills);
      }

      // Populate Education
      if (p.education && Array.isArray(p.education) && cvData.education.length === 0) {
          const newEdu = p.education.map((edu: any) => ({
              id: uuidv4(),
              institution: edu.institution || '',
              degree: edu.degree || '',
              field: '', 
              startDate: parseDateToMonth(edu.year?.split(/[-–]/)[0] || edu.year) || '',
              endDate: parseDateToMonth(edu.year?.split(/[-–]/)[1]) || '',
              current: (edu.year || '').toLowerCase().includes('present'),
              location: '',
          }));
          setEducation(newEdu);
      }

      // Populate Experience
      if (p.work_experience && Array.isArray(p.work_experience) && cvData.experience.length === 0) {
          const newExp = p.work_experience.map((exp: any) => ({
              id: uuidv4(),
              company: exp.company || '',
              position: exp.title || '',
              startDate: parseDateToMonth(exp.duration?.split(/[-–]/)[0]) || '',
              endDate: parseDateToMonth(exp.duration?.split(/[-–]/)[1]) || '',
              current: (exp.duration || '').toLowerCase().includes('present'),
              description: Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : (exp.responsibilities || ''),
              location: '',
          }));
          setExperience(newExp);
      }

      // Populate Projects
      if (p.projects && Array.isArray(p.projects) && cvData.projects.length === 0) {
          const newProjects = p.projects.map((proj: any) => ({
              id: uuidv4(),
              name: proj.name || '',
              description: proj.description || '',
              url: '',
              technologies: proj.technologies || [],
          }));
          setProjects(newProjects);
      }
      
      setHasPopulated(true);
      toast({
        title: "CV Data Populated",
        description: "We've filled in your personal details from your profile.",
      });
    }
  }, [profile, hasPopulated, cvData.personalInfo.fullName, updatePersonalInfo, setSkills, setEducation, setExperience, setProjects, toast]);

  if (isLoading && !hasPopulated && !cvData.personalInfo.fullName) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <CVEditorLayout
      sidebar={<EditorSidebar />}
      preview={<CVPreview />}
    />
  );
};

export default CVEditor;
