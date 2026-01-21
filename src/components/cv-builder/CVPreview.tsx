import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useCVStore } from '../../stores/cvStore';
import ModernTemplate from './templates/ModernTemplate';
import { Button } from '../ui/button';
import { Download, Loader2 } from 'lucide-react';

const CVPreview: React.FC = () => {
  const { data, style } = useCVStore();
  const componentRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = React.useState(false);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${data.personalInfo.fullName.replace(/\s+/g, '_')}_CV`,
    // @ts-ignore
    onBeforeGetContent: () => {
        setIsPrinting(true);
        return Promise.resolve();
    },
    onAfterPrint: () => setIsPrinting(false),
    onPrintError: () => setIsPrinting(false),
  });

  const handleExportJSON = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${data.personalInfo.fullName.replace(/\s+/g, '_')}_CV.json`;
    link.click();
  };

  const renderTemplate = () => {
    switch (style.layout) {
      case 'modern':
        return <ModernTemplate data={data} style={style} />;
      case 'classic':
        // Placeholder for Classic - falling back to Modern with different style tweaks if we had them
        // or a separate component. For now, let's reuse Modern but maybe we can add a 'classic' prop later
        return <ModernTemplate data={data} style={{ ...style, themeColor: '#333' }} />;
      case 'minimal':
         // Placeholder
        return <ModernTemplate data={data} style={{ ...style, themeColor: '#000' }} />;
      default:
        return <ModernTemplate data={data} style={style} />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-4 gap-2">
        <Button onClick={handleExportJSON} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export JSON
        </Button>
        <Button onClick={() => handlePrint && handlePrint()} disabled={isPrinting}>
          {isPrinting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Export PDF
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto flex justify-center bg-gray-100 p-4 border rounded">
         <div className="w-full max-w-[210mm] min-h-[297mm] origin-top scale-[0.6] sm:scale-[0.8] lg:scale-100 transition-transform duration-200">
            <div ref={componentRef} className="shadow-xl bg-white print:shadow-none min-h-[297mm]">
              {renderTemplate()}
            </div>
         </div>
      </div>
    </div>
  );
};

export default CVPreview;
