export interface CVProfile {
  $id: string;
  cv_filename: string;
  cv_file_id: string;
  $createdAt: string;
  $updatedAt: string;
  experience_level?: string;
  education?: string;
}

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  experience_level: string;
  education: string;
  strengths: string[];
  career_goals: string;
  links?: {
    linkedin: string;
    github: string;
    portfolio: string;
  };
}

export interface JobMatch {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    url: string;
    description: string;
  };
  match_score: number;
  match_reasons: string[];
}

export interface UploadCVResponse {
  success: boolean;
  profile?: ProfileData;
  error?: string;
  existing_filename?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
