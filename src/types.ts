export type ThemeMode = 'amoled' | 'dark' | 'light';

export type PortfolioProject = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  useCase?: string;
  demoUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  featured?: boolean;
  source?: 'admin' | 'github';
  updatedAt?: number | string;
};

export type Certificate = {
  id: string;
  title: string;
  description: string;
  issuer?: string;
  date?: string;
  imageUrl: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  message: string;
  status?: 'new' | 'replied' | 'closed';
  reply?: string;
  createdAt?: number;
};

export type RepoRequest = {
  id: string;
  name: string;
  email: string;
  projectTitle: string;
  reason: string;
  status?: 'pending' | 'approved' | 'declined' | 'mailed';
  reply?: string;
  createdAt?: number;
};

export type ResumeProfile = {
  title?: string;
  fileUrl?: string;
  updatedAt?: number;
};
