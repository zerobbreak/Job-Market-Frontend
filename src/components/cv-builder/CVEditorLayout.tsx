import React, { useState } from 'react';
import { Eye, PencilLine } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CVEditorLayoutProps {
  sidebar: React.ReactNode;
  preview: React.ReactNode;
}

const CVEditorLayout: React.FC<CVEditorLayoutProps> = ({ sidebar, preview }) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="space-y-6 pb-10">
      <header>
        <p className="mb-2 text-sm text-neutral-500">CV editor</p>
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Shape your CV
        </h1>
        <p className="mt-2 max-w-xl text-neutral-600 text-pretty">
          Edit each section and watch the page update as you go.
        </p>
      </header>

      {/* Mobile toggle */}
      <div className="inline-flex rounded-full bg-neutral-100 p-1 lg:hidden" role="tablist" aria-label="Editor view">
        {([
          ['edit', 'Edit', PencilLine],
          ['preview', 'Preview', Eye],
        ] as const).map(([tab, label, Icon]) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all',
              activeTab === tab
                ? 'bg-white text-neutral-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                : 'text-neutral-500 hover:text-neutral-900',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start">
        {/* Editor */}
        <div
          className={cn(
            'rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:sticky lg:top-8 lg:block lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto',
            activeTab === 'edit' ? 'block' : 'hidden',
          )}
        >
          {sidebar}
        </div>

        {/* Preview */}
        <div
          className={cn(
            'rounded-2xl border border-neutral-200 bg-[#FAFAF9] p-3 sm:p-4 lg:block',
            activeTab === 'preview' ? 'block' : 'hidden',
          )}
        >
          {preview}
        </div>
      </div>
    </div>
  );
};

export default CVEditorLayout;
