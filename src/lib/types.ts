
export type User = {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'manager';
  avatarUrl?: string;
};

export type Client = {
  id: string;
  name:string;
  email: string;
  avatarUrl: string;
};

export type Project = {
  id: string;
  name: string;
  clientId: string;
  managerId: string;
  projectType: string;
  startDate: string; // YYYY-MM-DD
  estimatedEndDate: string; // YYYY-MM-DD
  status: 'On Track' | 'At Risk' | 'Off Track' | 'On Hold' | 'Completed';
};

export type Milestone = {
    id: string;
    name: string;
    description: string;
    projectType: string;
};

export type WeeklyReport = {
  id?: string; // Optional: will not exist for new reports until saved
  projectId: string;
  week: number; // Sequential report number (1, 2, 3...)
  progress: number; // 0-100, represents the OVERALL project progress at the end of this week
  summary: string;
  status: 'On Track' | 'At Risk' | 'Off Track';
  milestones: string[]; // Array of milestone IDs completed this week
  createdAt: string; // ISO Date string
};
