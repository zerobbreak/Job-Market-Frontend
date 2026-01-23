export interface CVProfile {
  $id: string;
  cv_filename: string;
  cv_file_id: string;
  $createdAt: string;
  $updatedAt: string;
  experience_level?: string;
  education?: string;
  is_active?: boolean;
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
    skills?: string[];
    source?: string;
    date_posted?: string;
  };
  match_score: number;
  match_reasons: string[];
  matching_method?: 'semantic_embeddings' | 'tfidf' | 'none';
  success_probability?: number; // Percentage (0-100)
  match_band?: 'Exceptional' | 'Strong' | 'Good' | 'Moderate' | 'Basic';
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

/** CV Analysis API – uploaded document + AI analysis */
export interface CVAnalysisUploadedDocument {
  candidate_name: string;
  role_type: string;
  professional_summary: string;
  core_skills: string[];
  experience: string;
  skill_density_alignment: number;
  cv_filename: string;
  uploaded_at: string;
}

export interface CVAnalysisSkillGap {
  title: string;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface CVAnalysisAI {
  match_readiness_score: number;
  match_readiness_message: string;
  skill_gaps: CVAnalysisSkillGap[];
}

export interface CVAnalysisParsingStatus {
  active: boolean;
  progress: number;
  message: string;
}

export interface CVAnalysisResponse {
  success: boolean;
  uploaded_document: CVAnalysisUploadedDocument | null;
  ai_analysis: CVAnalysisAI | null;
  parsing_status?: CVAnalysisParsingStatus;
  error?: string;
}
