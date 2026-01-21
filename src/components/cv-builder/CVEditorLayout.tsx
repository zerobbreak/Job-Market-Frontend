import React, { useState } from 'react';
import { Eye, Edit } from 'lucide-react';
import { Button } from '../ui/button';

interface CVEditorLayoutProps {
  sidebar: React.ReactNode;
  preview: React.ReactNode;
}

const CVEditorLayout: React.FC<CVEditorLayoutProps> = ({ sidebar, preview }) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50 flex gap-2">
        <Button
          variant={activeTab === 'edit' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('edit')}
          className="shadow-lg"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          variant={activeTab === 'preview' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('preview')}
          className="shadow-lg"
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>

      {/* Sidebar (Editor) */}
      <div
        className={`
          w-full lg:w-[450px] bg-white border-r border-gray-200 overflow-y-auto
          ${activeTab === 'edit' ? 'block' : 'hidden lg:block'}
        `}
      >
        <div className="p-6 pb-24 lg:pb-6">
          {sidebar}
        </div>
      </div>

      {/* Preview Area */}
      <div
        className={`
          flex-1 bg-gray-100 overflow-y-auto p-4 lg:p-8 flex justify-center
          ${activeTab === 'preview' ? 'block' : 'hidden lg:flex'}
        `}
      >
        <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl">
          {preview}
        </div>
      </div>
    </div>
  );
};

export default CVEditorLayout;
