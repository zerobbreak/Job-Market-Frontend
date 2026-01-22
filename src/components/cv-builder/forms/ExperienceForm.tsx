import React from 'react';
import { useCVStore, type Experience } from '../../../stores/cvStore';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Trash2, Plus, AlertCircle } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { experienceSchema } from '@/lib/schemas';
import { useEffect } from 'react';
import AIImproveButton from '../AIImproveButton';

type ExperienceItem = z.infer<typeof experienceSchema>;

// Schema for the array of experience items
const experienceArraySchema = z.object({
  experience: z.array(experienceSchema)
});

type ExperienceFormValues = z.infer<typeof experienceArraySchema>;

const ExperienceForm: React.FC = () => {
  const { data, addExperience: addStoreExperience, updateExperience, removeExperience: removeStoreExperience } = useCVStore();

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceArraySchema) as any,
    defaultValues: {
      experience: data.experience
    },
    mode: "onChange"
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience"
  });

  // Watch for changes and sync with store
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change' && name && value.experience) {
        // Parse index from name like "experience.0.company"
        const match = name.match(/experience\.(\d+)\.(\w+)/);
        if (match) {
          const index = parseInt(match[1]);
          const field = match[2] as keyof ExperienceItem;
          const expItem = value.experience[index];
          
          if (expItem && data.experience[index]) {
             // Sync specific field change to store
             const val = expItem[field];
             updateExperience(data.experience[index].id, { [field]: val } as Partial<Experience>);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, data.experience, updateExperience]);

  const handleAdd = () => {
    addStoreExperience();
    append({
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
    });
  };

  const handleRemove = (index: number, id: string) => {
    removeStoreExperience(id);
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
              onClick={() => handleRemove(index, data.experience[index]?.id || '')}
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`experience.${index}.company`}>
                Company <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register(`experience.${index}.company`)}
                placeholder="Company Name"
                className={errors.experience?.[index]?.company ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.experience?.[index]?.company && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.experience[index]?.company?.message}
                  </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`experience.${index}.position`}>
                Position <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register(`experience.${index}.position`)}
                placeholder="Job Title"
                className={errors.experience?.[index]?.position ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
               {errors.experience?.[index]?.position && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.experience[index]?.position?.message}
                  </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`experience.${index}.startDate`}>
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="month"
                {...register(`experience.${index}.startDate`)}
                className={errors.experience?.[index]?.startDate ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
               {errors.experience?.[index]?.startDate && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.experience[index]?.startDate?.message}
                  </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`experience.${index}.endDate`}>End Date</Label>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <Input
                        type="month"
                        {...register(`experience.${index}.endDate`)}
                        disabled={watch(`experience.${index}.current`)}
                    />
                    <div className="flex items-center gap-2 min-w-[80px]">
                    <input
                        type="checkbox"
                        id={`experience.${index}.current`}
                        {...register(`experience.${index}.current`)}
                        className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor={`experience.${index}.current`} className="cursor-pointer">Current</Label>
                    </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`experience.${index}.location`}>Location</Label>
            <Input
              {...register(`experience.${index}.location`)}
              placeholder="City, Country"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor={`experience.${index}.description`}>Description</Label>
                <AIImproveButton
                    text={watch(`experience.${index}.description`)}
                    section="experience description"
                    onImprove={(newText) => {
                        setValue(`experience.${index}.description`, newText, { shouldDirty: true });
                        updateExperience(data.experience[index].id, { description: newText });
                    }} 
                />
            </div>
            <Textarea
              {...register(`experience.${index}.description`)}
              placeholder="Describe your responsibilities and achievements..."
              rows={3}
              className={errors.experience?.[index]?.description ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
             {errors.experience?.[index]?.description && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.experience[index]?.description?.message}
                  </p>
              )}
          </div>
        </div>
      ))}

      <Button onClick={handleAdd} className="w-full" variant="outline" type="button">
        <Plus className="w-4 h-4 mr-2" />
        Add Experience
      </Button>
    </div>
  );
};

export default ExperienceForm;
