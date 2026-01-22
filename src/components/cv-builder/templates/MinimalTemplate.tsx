import React from 'react';
import { type CVData, type CVStyle } from '../../../stores/cvStore';
import { Mail, Phone, MapPin, Linkedin, Globe, Github } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  style: CVStyle;
}

const MinimalTemplate: React.FC<TemplateProps> = ({ data, style }) => {
  const { personalInfo, experience, education, skills, projects } = data;
  const { fontFamily, fontSize } = style;
  // Minimal template ignores themeColor mostly, using strictly black/gray scale or very subtle accents

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
      className="flex flex-col h-full min-h-[297mm] w-full p-16 bg-white text-gray-900"
      style={{ fontFamily: getFontFamily() }}
    >
      {/* Header - Left Aligned, Very Clean */}
      <header className="mb-12">
        <h1 className="text-5xl font-light tracking-tight mb-4 text-black">
          {personalInfo.fullName}
        </h1>
        <p className="text-xl text-gray-500 font-light mb-6 tracking-wide uppercase">
            {personalInfo.jobTitle}
        </p>
        
        <div className="flex flex-col gap-1 text-sm text-gray-500 font-light">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.address && <span>{personalInfo.address}</span>}
          <div className="flex gap-4 mt-2">
            {personalInfo.linkedin && (
                <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="hover:text-black transition-colors">LinkedIn</a>
            )}
            {personalInfo.github && (
                <a href={personalInfo.github} target="_blank" rel="noreferrer" className="hover:text-black transition-colors">GitHub</a>
            )}
            {personalInfo.website && (
                <a href={personalInfo.website} target="_blank" rel="noreferrer" className="hover:text-black transition-colors">Portfolio</a>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Column */}
        <div className="col-span-8 space-y-10">
            {/* Experience */}
            {experience.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Experience</h3>
                    <div className="space-y-8">
                        {experience.map(exp => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline mb-2">
                                    <h4 className="text-lg font-medium text-black">{exp.position}</h4>
                                    <span className="text-sm text-gray-400 font-light">
                                        {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-500 mb-3">{exp.company}</div>
                                <p className={`text-gray-700 font-light leading-relaxed ${getFontSizeClass()}`}>
                                    {exp.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Projects</h3>
                    <div className="grid grid-cols-1 gap-6">
                        {projects.map(proj => (
                            <div key={proj.id}>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <h4 className="text-lg font-medium text-black">{proj.name}</h4>
                                    {proj.url && (
                                        <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-black">↗</a>
                                    )}
                                </div>
                                <p className={`text-gray-700 font-light mb-2 ${getFontSizeClass()}`}>{proj.description}</p>
                                {proj.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {proj.technologies.map((tech, i) => (
                                            <span key={i} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-sm border border-gray-100">
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

        {/* Sidebar Column */}
        <div className="col-span-4 space-y-10">
             {/* Summary */}
             {personalInfo.summary && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">About</h3>
                    <p className={`text-gray-700 font-light leading-relaxed ${getFontSizeClass()}`}>
                        {personalInfo.summary}
                    </p>
                </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Skills</h3>
                    <div className="space-y-2">
                        {skills.map(skill => (
                            <div key={skill.id} className="flex justify-between items-center border-b border-gray-100 pb-1">
                                <span className="text-gray-800 font-light">{skill.name}</span>
                                {/* Optional: Hide level for super minimal look, or keep it subtle */}
                                {/* <span className="text-xs text-gray-400">{skill.level}</span> */}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {education.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Education</h3>
                    <div className="space-y-4">
                        {education.map(edu => (
                            <div key={edu.id}>
                                <div className="text-gray-900 font-medium">{edu.institution}</div>
                                <div className="text-gray-600 text-sm">{edu.degree}</div>
                                <div className="text-gray-400 text-xs mt-1">
                                    {edu.startDate} — {edu.current ? 'Present' : edu.endDate}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
      </div>
    </div>
  );
};

export default MinimalTemplate;
