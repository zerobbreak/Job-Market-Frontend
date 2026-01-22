import React from 'react';
import { type CVData, type CVStyle } from '../../../stores/cvStore';
import { Mail, Phone, MapPin, Linkedin, Globe, Github } from 'lucide-react';

interface TemplateProps {
  data: CVData;
  style: CVStyle;
}

const CreativeTemplate: React.FC<TemplateProps> = ({ data, style }) => {
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
        default: return '"Roboto", sans-serif';
    }
  };

  return (
    <div 
      className="flex flex-col h-full min-h-[297mm] w-full bg-white text-gray-800"
      style={{ fontFamily: getFontFamily() }}
    >
      {/* Creative Header with Geometric Shapes */}
      <div className="relative p-12 overflow-hidden text-white" style={{ backgroundColor: themeColor }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
                <h1 className="text-5xl font-extrabold tracking-tight mb-2">
                    {personalInfo.fullName}
                </h1>
                <p className="text-2xl font-medium opacity-90 tracking-wide">
                    {personalInfo.jobTitle}
                </p>
            </div>
            
            <div className="flex flex-col gap-2 text-sm font-medium opacity-90 text-right">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>{personalInfo.phone}</span>}
                {personalInfo.address && <span>{personalInfo.address}</span>}
            </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-12 gap-8">
        {/* Left Column (Main) */}
        <div className="col-span-8 space-y-10">
             {/* Summary */}
             {personalInfo.summary && (
                <section>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="w-12 h-1 bg-gray-200"></span>
                        <h2 className="text-xl font-black uppercase tracking-widest text-gray-400">Profile</h2>
                    </div>
                    <p className={`text-gray-700 leading-relaxed font-medium ${getFontSizeClass()}`}>
                        {personalInfo.summary}
                    </p>
                </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <section>
                    <div className="flex items-center gap-4 mb-6">
                         <span className="w-12 h-1 bg-gray-200"></span>
                        <h2 className="text-xl font-black uppercase tracking-widest text-gray-400">Experience</h2>
                    </div>
                    <div className="border-l-4 ml-2 pl-6 space-y-8" style={{ borderColor: themeColor }}>
                        {experience.map(exp => (
                            <div key={exp.id} className="relative">
                                {/* Timeline dot */}
                                <div className="absolute -left-[34px] top-1 w-4 h-4 rounded-full border-4 border-white" style={{ backgroundColor: themeColor }}></div>
                                
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-bold text-gray-800">{exp.position}</h3>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500">
                                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <div className="text-md font-bold mb-3" style={{ color: themeColor }}>
                                    {exp.company}
                                </div>
                                <p className={`text-gray-600 ${getFontSizeClass()}`}>
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
                    <div className="flex items-center gap-4 mb-6">
                         <span className="w-12 h-1 bg-gray-200"></span>
                        <h2 className="text-xl font-black uppercase tracking-widest text-gray-400">Projects</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map(proj => (
                            <div key={proj.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-800">{proj.name}</h3>
                                     {proj.url && (
                                        <a href={proj.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-800">
                                            <Globe size={14} />
                                        </a>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{proj.description}</p>
                                <div className="flex flex-wrap gap-1">
                                    {proj.technologies.map((tech, i) => (
                                        <span key={i} className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-white text-gray-500 border border-gray-200">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="col-span-4 space-y-10">
            {/* Social Links */}
             <section className="p-6 rounded-2xl bg-gray-50">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Connect</h3>
                <div className="space-y-3 text-sm">
                    {personalInfo.linkedin && (
                        <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-gray-900">
                            <Linkedin size={18} /> <span>LinkedIn</span>
                        </a>
                    )}
                    {personalInfo.github && (
                        <a href={personalInfo.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-gray-900">
                            <Github size={18} /> <span>GitHub</span>
                        </a>
                    )}
                    {personalInfo.website && (
                        <a href={personalInfo.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-gray-900">
                            <Globe size={18} /> <span>Portfolio</span>
                        </a>
                    )}
                </div>
            </section>

            {/* Skills */}
            {skills.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {skills.map(skill => (
                            <span 
                                key={skill.id} 
                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-white shadow-sm"
                                style={{ backgroundColor: themeColor }}
                            >
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {education.length > 0 && (
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Education</h3>
                    <div className="space-y-6">
                        {education.map(edu => (
                            <div key={edu.id} className="relative pl-4 border-l-2 border-gray-200">
                                <div className="font-bold text-gray-800 leading-tight mb-1">{edu.degree}</div>
                                <div className="text-sm text-gray-500 mb-1">{edu.institution}</div>
                                <div className="text-xs font-bold uppercase text-gray-400">
                                    {edu.startDate} - {edu.endDate}
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

export default CreativeTemplate;
