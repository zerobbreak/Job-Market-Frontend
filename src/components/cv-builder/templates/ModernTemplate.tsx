import React from 'react';
import { type CVData, type CVStyle } from '../../../stores/cvStore';
import { Mail, Phone, MapPin, Linkedin, Globe, Github } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  style: CVStyle;
}

const ModernTemplate: React.FC<TemplateProps> = ({ data, style }) => {
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
      default: return '"Inter", sans-serif';
    }
  };

  return (
    <div 
      className="flex h-full min-h-[297mm] w-full"
      style={{ fontFamily: getFontFamily() }}
    >
      {/* Left Sidebar */}
      <div 
        className="w-1/3 text-white p-8 flex flex-col gap-6"
        style={{ backgroundColor: themeColor }}
      >
        <div className="space-y-2">
          {/* Avatar Placeholder if needed, for now just Initials or Name */}
          <div className="w-32 h-32 bg-white/20 rounded-full mx-auto flex items-center justify-center text-4xl font-bold mb-6">
            {personalInfo.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          
          <h2 className="text-xl font-semibold border-b border-white/30 pb-2 mb-4">Contact</h2>
          <div className="space-y-3 text-sm">
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span className="break-all">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.address && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{personalInfo.address}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin size={16} />
                <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="underline hover:text-white/80">LinkedIn</a>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-2">
                <Github size={16} />
                <a href={personalInfo.github} target="_blank" rel="noreferrer" className="underline hover:text-white/80">GitHub</a>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-2">
                <Globe size={16} />
                <a href={personalInfo.website} target="_blank" rel="noreferrer" className="underline hover:text-white/80">Portfolio</a>
              </div>
            )}
          </div>
        </div>

        {skills.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold border-b border-white/30 pb-2 mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <span key={skill.id} className="bg-white/20 px-2 py-1 rounded text-sm">
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold border-b border-white/30 pb-2 mb-4">Education</h2>
            <div className="space-y-4">
              {education.map(edu => (
                <div key={edu.id}>
                  <div className="font-bold">{edu.degree}</div>
                  <div className="text-sm opacity-90">{edu.field}</div>
                  <div className="text-sm opacity-90">{edu.institution}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-8 bg-white text-gray-800">
        <header className="mb-8 border-b-2 pb-6" style={{ borderColor: themeColor }}>
          <h1 className="text-4xl font-bold uppercase tracking-wide" style={{ color: themeColor }}>
            {personalInfo.fullName}
          </h1>
          <p className="text-xl mt-2 text-gray-600 font-medium">
            {personalInfo.jobTitle}
          </p>
          <p className={`mt-4 text-gray-600 leading-relaxed ${getFontSizeClass()}`}>
            {personalInfo.summary}
          </p>
        </header>

        {experience.length > 0 && (
          <section className="mb-8">
            <h2 
              className="text-2xl font-bold mb-6 uppercase tracking-wider flex items-center gap-2"
              style={{ color: themeColor }}
            >
              Work Experience
            </h2>
            <div className="space-y-6">
              {experience.map(exp => (
                <div key={exp.id} className="relative pl-4 border-l-2" style={{ borderColor: themeColor }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-xl font-bold text-gray-800">{exp.position}</h3>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-lg font-medium text-gray-700 mb-2">{exp.company} | {exp.location}</div>
                  <p className={`text-gray-600 whitespace-pre-line ${getFontSizeClass()}`}>
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <h2 
              className="text-2xl font-bold mb-6 uppercase tracking-wider"
              style={{ color: themeColor }}
            >
              Projects
            </h2>
            <div className="space-y-6">
              {projects.map(project => (
                <div key={project.id}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                    {project.url && (
                      <a 
                        href={project.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm underline"
                        style={{ color: themeColor }}
                      >
                        View Project
                      </a>
                    )}
                  </div>
                  <p className={`text-gray-600 mb-2 ${getFontSizeClass()}`}>{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate;
