import React from 'react';
import { useCVStore, type Education } from '../../../stores/cvStore';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { educationSchema } from '@/lib/schemas';
import { useEffect } from 'react';

type EducationItem = z.infer<typeof educationSchema>;

// Schema for the array of education items
const educationArraySchema = z.object({
  education: z.array(educationSchema)
});

type EducationFormValues = z.infer<typeof educationArraySchema>;

const EducationForm: React.FC = () => {
  const { data, updateEducation, addEducation: addStoreEducation, removeEducation: removeStoreEducation } = useCVStore();

  const {
    register,
    control,
    watch,
    formState: { errors }
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationArraySchema) as any,
    defaultValues: {
      education: data.education
    },
    mode: "onChange"
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education"
  });

  // Watch for changes and sync with store
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && name && value.education) {
        // Parse index from name like "education.0.institution"
        const match = name.match(/education\.(\d+)\.(\w+)/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2] as keyof EducationItem;
          const eduItem = value.education[index];
          
          if (eduItem && data.education[index]) {
             // Sync specific field change to store
             const val = eduItem[field];
             updateEducation(data.education[index].id, { [field]: val } as Partial<Education>);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, data.education, updateEducation]);

  // Sync store changes (add/remove) to form
  // We need to be careful not to cause infinite loops
  // This is a simplified approach: we trust the store for structure (add/remove)
  // and the form for content (inputs)
  
  const handleAdd = () => {
    addStoreEducation();
    // The store update will trigger a re-render, but we also need to tell the form
    // However, since we initialized with defaultValues from store, 
    // simply appending to form state is safer for UI consistency
    append({
        institution: '',
        degree: '',
        field: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
    });
  };

  const handleRemove = (index: number, id: string) => {
    removeStoreEducation(id);
    remove(index);
  };

  return (
    <div className="space-y-6">
      {fields.map((field, index) => (
        <div key={field.id} className="p-4 border rounded-lg bg-gray-50 space-y-4 relative group transition-all hover:shadow-md">
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleRemove(index, data.education[index]?.id || '')}
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`education.${index}.institution`}>
                Institution <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register(`education.${index}.institution`)}
                placeholder="University Name"
                className={errors.education?.[index]?.institution ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.education?.[index]?.institution && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.education[index]?.institution?.message}
                  </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`education.${index}.degree`}>
                Degree <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register(`education.${index}.degree`)}
                placeholder="Bachelor's, Master's, etc."
                className={errors.education?.[index]?.degree ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.education?.[index]?.degree && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.education[index]?.degree?.message}
                  </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`education.${index}.field`}>
                Field of Study <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register(`education.${index}.field`)}
                placeholder="Computer Science"
                className={errors.education?.[index]?.field ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
               {errors.education?.[index]?.field && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.education[index]?.field?.message}
                  </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`education.${index}.location`}>Location</Label>
              <Input
                {...register(`education.${index}.location`)}
                placeholder="City, Country"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`education.${index}.startDate`}>
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="month"
                {...register(`education.${index}.startDate`)}
                className={errors.education?.[index]?.startDate ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.education?.[index]?.startDate && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.education[index]?.startDate?.message}
                  </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`education.${index}.endDate`}>End Date</Label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <Input
                        type="month"
                        {...register(`education.${index}.endDate`)}
                        disabled={watch(`education.${index}.current`)}
                    />
                    <div className="flex items-center gap-2 min-w-[80px]">
                    <input
                        type="checkbox"
                        id={`education.${index}.current`}
                        {...register(`education.${index}.current`)}
                        className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor={`education.${index}.current`} className="cursor-pointer">Current</Label>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button onClick={handleAdd} className="w-full" variant="outline" type="button">
        <Plus className="w-4 h-4 mr-2" />
        Add Education
      </Button>
    </div>
  );
};

export default EducationForm;
