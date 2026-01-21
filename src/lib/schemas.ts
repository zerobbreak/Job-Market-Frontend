import { z } from "zod";
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().refine((val) => {
      if (!val) return true; // Allow empty
      const phoneNumber = parsePhoneNumberFromString(val);
      return phoneNumber?.isValid();
  }, "Invalid phone number format").optional().or(z.literal("")),
  // Split address fields for UI, but we'll map them to a single address string in the store or keep them separate if we update store
  location: z.string().min(2, "Location must be at least 2 characters").optional().or(z.literal("")), 
  jobTitle: z.string().min(2, "Job title is required"),
  summary: z.string().max(500, "Summary must not exceed 500 characters").optional(),
  linkedin: z.string().refine((val) => !val || val.startsWith('http') || val.startsWith('www'), "Invalid URL").transform(val => val && !val.startsWith('http') ? `https://${val}` : val).optional().or(z.literal("")),
  github: z.string().refine((val) => !val || val.startsWith('http') || val.startsWith('www'), "Invalid URL").transform(val => val && !val.startsWith('http') ? `https://${val}` : val).optional().or(z.literal("")),
  website: z.string().refine((val) => !val || val.startsWith('http') || val.startsWith('www'), "Invalid URL").transform(val => val && !val.startsWith('http') ? `https://${val}` : val).optional().or(z.literal("")),
});

export const educationSchema = z.object({
  institution: z.string().min(2, "Institution is required"),
  degree: z.string().min(2, "Degree is required"),
  field: z.string().min(2, "Field of study is required"),
  location: z.string().optional(),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
});

export const experienceSchema = z.object({
  company: z.string().min(2, "Company name is required"),
  position: z.string().min(2, "Position is required"),
  location: z.string().optional(),
  startDate: z.string().min(4, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().min(10, "Description should be at least 10 characters").optional().or(z.literal("")),
});

export type PersonalInfoValues = z.infer<typeof personalInfoSchema>;
export type EducationValues = z.infer<typeof educationSchema>;
export type ExperienceValues = z.infer<typeof experienceSchema>;