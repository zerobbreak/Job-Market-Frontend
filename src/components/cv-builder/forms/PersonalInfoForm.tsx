import React, { useEffect } from 'react';
import { useCVStore } from '../../../stores/cvStore';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { personalInfoSchema, type PersonalInfoValues } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import AIImproveButton from '../AIImproveButton';

const PersonalInfoForm: React.FC = () => {
  const { data, updatePersonalInfo } = useCVStore();
  const { personalInfo } = data;

  const {
    register,
    formState: { errors },
    watch,
  } = useForm<PersonalInfoValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
        fullName: personalInfo.fullName || "",
        jobTitle: personalInfo.jobTitle || "",
        email: personalInfo.email || "",
        phone: personalInfo.phone || "",
        location: personalInfo.address || "",
        summary: personalInfo.summary || "",
        linkedin: personalInfo.linkedin || "",
        github: personalInfo.github || "",
        website: personalInfo.website || "",
    },
    mode: "onChange"
  });

  // Watch all fields and update store (Debounce could be added here for performance)
  const watchedValues = watch();
  const summaryValue = watch("summary");

  useEffect(() => {
      // Map schema fields back to store fields if they differ (e.g., location -> address)
      updatePersonalInfo({
          fullName: watchedValues.fullName,
          jobTitle: watchedValues.jobTitle,
          email: watchedValues.email,
          phone: watchedValues.phone,
          address: watchedValues.location,
          summary: watchedValues.summary,
          linkedin: watchedValues.linkedin,
          github: watchedValues.github,
          website: watchedValues.website
      });
  }, [JSON.stringify(watchedValues), updatePersonalInfo]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className={cn(errors.fullName && "text-red-500")}>
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            {...register("fullName")}
            placeholder="John Doe"
            className={cn(errors.fullName && "border-red-500")}
          />
          {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="jobTitle" className={cn(errors.jobTitle && "text-red-500")}>
            Job Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="jobTitle"
            {...register("jobTitle")}
            placeholder="Software Engineer"
            className={cn(errors.jobTitle && "border-red-500")}
          />
          {errors.jobTitle && <p className="text-xs text-red-500">{errors.jobTitle.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className={cn(errors.email && "text-red-500")}>
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="john@example.com"
            className={cn(errors.email && "border-red-500")}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className={cn(errors.phone && "text-red-500")}>Phone</Label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="+1 234 567 890"
            className={cn(errors.phone && "border-red-500")}
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location" className={cn(errors.location && "text-red-500")}>Address / Location</Label>
        <Input
          id="location"
          {...register("location")}
          placeholder="City, Country"
          className={cn(errors.location && "border-red-500")}
        />
        {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <Label htmlFor="summary" className={cn(errors.summary && "text-red-500")}>Professional Summary</Label>
            <div className="flex items-center gap-2">
                <AIImproveButton
                    text={watch('summary') || ''}
                    section="professional summary"
                    onImprove={(newText) => {
                        setValue('summary', newText, { shouldDirty: true });
                        updatePersonalInfo({ summary: newText });
                    }} 
                />
                <span className={cn("text-xs", (summaryValue?.length || 0) > 500 ? "text-red-500" : "text-muted-foreground")}>
                    {summaryValue?.length || 0}/500
                </span>
            </div>
        </div>
        <Textarea
          id="summary"
          {...register("summary")}
          placeholder="Brief overview of your professional background..."
          rows={4}
          className={cn(errors.summary && "border-red-500")}
        />
        {errors.summary && <p className="text-xs text-red-500">{errors.summary.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Social Links</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
             <Input
                {...register("linkedin")}
                placeholder="LinkedIn URL"
                className={cn(errors.linkedin && "border-red-500")}
             />
             {errors.linkedin && <p className="text-xs text-red-500">{errors.linkedin.message}</p>}
          </div>
          <div className="space-y-1">
             <Input
                {...register("github")}
                placeholder="GitHub URL"
                className={cn(errors.github && "border-red-500")}
             />
             {errors.github && <p className="text-xs text-red-500">{errors.github.message}</p>}
          </div>
          <div className="space-y-1">
             <Input
                {...register("website")}
                placeholder="Portfolio Website"
                className={cn(errors.website && "border-red-500")}
             />
             {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
