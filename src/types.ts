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
  pdfUrl?: string;
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

export type StoreProject = {
  id: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  demoUrl?: string;
  imageUrl: string;
  screenshots?: string[]; // list of screenshot urls
  updatedAt?: number | string;
};

export type Order = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  projectId: string;
  projectTitle: string;
  price: number;
  upiTxnId?: string;
  paymentScreenshotUrl?: string;
  status: 'pending' | 'completed' | 'failed' | 'free_claimed';
  createdAt?: number;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  gameId: 'flappy' | 'dino' | 'dodge' | 'snake';
  createdAt?: number;
};

export type ResumeProfile = {
  title?: string;
  fileUrl?: string;
  updatedAt?: number;
};

