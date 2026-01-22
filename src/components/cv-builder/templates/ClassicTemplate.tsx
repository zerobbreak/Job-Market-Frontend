import React from 'react';
import { type CVData, type CVStyle } from '../../../stores/cvStore';
import { Mail, Phone, MapPin, Linkedin, Globe, Github } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  style: CVStyle;
}

const ClassicTemplate: React.FC<TemplateProps> = ({ data, style }) => {
  const { personalInfo, experience, education, skills, projects } = data;
  const { themeColor, fontFamily, fontSize } = style;

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const getFontFamily = () => {
    switch (fontFamily) {
      case 'Inter': return '"Inter", sans-serif';
      case 'Merriweather': return '"Merriweather", serif';
      case 'Roboto': return '"Roboto", sans-serif';
      case 'Open Sans': return '"Open Sans", sans-serif';
      default: return '"Merriweather", serif'; // Default to Serif for Classic
    }
  };

  return (
    <div 
      className="flex flex-col h-full min-h-[297mm] w-full p-12 bg-white text-gray-900"
      style={{ fontFamily: getFontFamily() }}
    >
      {/* Header */}
      <div className="text-center border-b-2 pb-6 mb-6" style={{ borderColor: themeColor }}>
        <h1 className="text-4xl font-bold uppercase tracking-wider mb-2">
          {personalInfo.fullName}
        </h1>
        <p className="text-xl text-gray-700 mb-4 font-medium">
            {personalInfo.jobTitle}
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail size={14} />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone size={14} />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.address && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{personalInfo.address}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin size={14} />
              <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="underline hover:text-gray-900">LinkedIn</a>
            </div>
          )}
           {personalInfo.github && (
            <div className="flex items-center gap-1">
              <Github size={14} />
              <a href={personalInfo.github} target="_blank" rel="noreferrer" className="underline hover:text-gray-900">GitHub</a>
            </div>
          )}
          {personalInfo.website && (
            <div className="flex items-center gap-1">
              <Globe size={14} />
              <a href={personalInfo.website} target="_blank" rel="noreferrer" className="underline hover:text-gray-900">Portfolio</a>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <h2 
            className="text-lg font-bold uppercase border-b mb-3 pb-1"
            style={{ color: themeColor, borderColor: themeColor }}
          >
            Professional Summary
          </h2>
          <p className={`text-gray-800 leading-relaxed ${getFontSizeClass()}`}>
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 
            className="text-lg font-bold uppercase border-b mb-4 pb-1"
            style={{ color: themeColor, borderColor: themeColor }}
          >
            Work Experience
          </h2>
          <div className="space-y-5">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                  <span className="text-sm font-medium text-gray-600">
                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-md font-semibold text-gray-700 italic mb-2">
                    {exp.company} {exp.location && `| ${exp.location}`}
                </div>
                <p className={`text-gray-800 whitespace-pre-line ${getFontSizeClass()}`}>
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 
            className="text-lg font-bold uppercase border-b mb-4 pb-1"
            style={{ color: themeColor, borderColor: themeColor }}
          >
            Education
          </h2>
          <div className="space-y-3">
            {education.map(edu => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-gray-900">{edu.institution}</div>
                  <div className="text-gray-800">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                </div>
                <div className="text-sm text-gray-600 text-right">
                  <div>{edu.location}</div>
                  <div>{edu.startDate} - {edu.current ? 'Present' : edu.endDate}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h2 
            className="text-lg font-bold uppercase border-b mb-4 pb-1"
            style={{ color: themeColor, borderColor: themeColor }}
          >
            Key Projects
          </h2>
          <div className="space-y-4">
            {projects.map(project => (
              <div key={project.id}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-gray-900">{project.name}</h3>
                   {project.url && (
                      <a 
                        href={project.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs underline text-gray-500 hover:text-gray-900"
                      >
                        View Project
                      </a>
                    )}
                </div>
                <p className={`text-gray-800 mb-1 ${getFontSizeClass()}`}>{project.description}</p>
                {project.technologies.length > 0 && (
                   <div className="text-sm text-gray-600">
                      <span className="font-semibold">Technologies:</span> {project.technologies.join(', ')}
                   </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <h2 
            className="text-lg font-bold uppercase border-b mb-3 pb-1"
            style={{ color: themeColor, borderColor: themeColor }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {skills.map(skill => (
              <div key={skill.id} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></span>
                <span className="font-medium text-gray-800">{skill.name}</span>
                <span className="text-sm text-gray-500">({skill.level})</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ClassicTemplate;
