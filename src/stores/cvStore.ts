import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  location: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  current: boolean;
  location: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  years?: string; // e.g. "2 years" or just number string
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  technologies: string[];
}

export interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
    jobTitle: string;
    linkedin: string;
    website: string;
    github: string;
  };
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
}

export interface CVStyle {
  themeColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  layout: 'modern' | 'classic' | 'minimal';
}

interface CVState {
  data: CVData;
  style: CVStyle;
  
  // Personal Info Actions
  updatePersonalInfo: (info: Partial<CVData['personalInfo']>) => void;
  
  // Experience Actions
  addExperience: () => void;
  setExperience: (experience: Experience[]) => void;
  updateExperience: (id: string, exp: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (startIndex: number, endIndex: number) => void;
  
  // Education Actions
  addEducation: () => void;
  setEducation: (education: Education[]) => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  
  // Skills Actions
  addSkill: () => void;
  setSkills: (skills: Skill[]) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  
  // Project Actions
  addProject: () => void;
  setProjects: (projects: Project[]) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;

  // Style Actions
  updateStyle: (style: Partial<CVStyle>) => void;
  
  // Reset
  resetCV: () => void;
}

const initialData: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    jobTitle: '',
    linkedin: '',
    website: '',
    github: '',
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
};

const initialStyle: CVStyle = {
  themeColor: '#2563eb', // blue-600
  fontFamily: 'Inter',
  fontSize: 'medium',
  layout: 'modern',
};

export const useCVStore = create<CVState>()(
  persist(
    (set) => ({
      data: initialData,
      style: initialStyle,

      updatePersonalInfo: (info) =>
        set((state) => ({
          data: {
            ...state.data,
            personalInfo: { ...state.data.personalInfo, ...info },
          },
        })),

      addExperience: () =>
        set((state) => ({
          data: {
            ...state.data,
            experience: [
              ...state.data.experience,
              {
                id: uuidv4(),
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                current: false,
                description: '',
                location: '',
              },
            ],
          },
        })),

      setExperience: (experience) =>
        set((state) => ({
            data: {
                ...state.data,
                experience: experience
            }
        })),

      updateExperience: (id, exp) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.map((item) =>
              item.id === id ? { ...item, ...exp } : item
            ),
          },
        })),

      removeExperience: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            experience: state.data.experience.filter((item) => item.id !== id),
          },
        })),
        
      reorderExperience: (startIndex, endIndex) =>
        set((state) => {
          const result = Array.from(state.data.experience);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return { data: { ...state.data, experience: result } };
        }),

      addEducation: () =>
        set((state) => ({
          data: {
            ...state.data,
            education: [
              ...state.data.education,
              {
                id: uuidv4(),
                institution: '',
                degree: '',
                field: '',
                startDate: '',
                endDate: '',
                current: false,
                location: '',
              },
            ],
          },
        })),

      setEducation: (education) =>
        set((state) => ({
            data: {
                ...state.data,
                education: education
            }
        })),

      updateEducation: (id, edu) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.map((item) =>
              item.id === id ? { ...item, ...edu } : item
            ),
          },
        })),

      removeEducation: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.filter((item) => item.id !== id),
          },
        })),

      addSkill: () =>
        set((state) => ({
          data: {
            ...state.data,
            skills: [
              ...state.data.skills,
              { id: uuidv4(), name: '', level: 'Intermediate' },
            ],
          },
        })),

      setSkills: (skills) =>
        set((state) => ({
            data: {
                ...state.data,
                skills: skills
            }
        })),

      updateSkill: (id, skill) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.map((item) =>
              item.id === id ? { ...item, ...skill } : item
            ),
          },
        })),

      removeSkill: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            skills: state.data.skills.filter((item) => item.id !== id),
          },
        })),

      addProject: () =>
        set((state) => ({
          data: {
            ...state.data,
            projects: [
              ...state.data.projects,
              {
                id: uuidv4(),
                name: '',
                description: '',
                url: '',
                technologies: [],
              },
            ],
          },
        })),

      setProjects: (projects) =>
        set((state) => ({
            data: {
                ...state.data,
                projects: projects
            }
        })),

      updateProject: (id, project) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((item) =>
              item.id === id ? { ...item, ...project } : item
            ),
          },
        })),

      removeProject: (id) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.filter((item) => item.id !== id),
          },
        })),

      updateStyle: (style) =>
        set((state) => ({
          style: { ...state.style, ...style },
        })),

      resetCV: () => set({ data: initialData, style: initialStyle }),
    }),
    {
      name: 'cv-storage',
    }
  )
);
