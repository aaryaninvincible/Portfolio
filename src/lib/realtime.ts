import { onValue, ref, remove, serverTimestamp, set, update, push } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import type { Certificate, ContactMessage, PortfolioProject, RepoRequest, ResumeProfile, StoreProject, Order, LeaderboardEntry } from '../types';

const snapshotToList = <T extends { id: string }>(value: unknown): T[] => {
  if (!value || typeof value !== 'object') return [];

  return Object.entries(value as Record<string, Omit<T, 'id'>>)
    .map(([id, item]) => ({ id, ...item }) as T)
    .sort((a, b) => {
      const aTime = Number((a as { createdAt?: number; updatedAt?: number }).createdAt || (a as { updatedAt?: number }).updatedAt || 0);
      const bTime = Number((b as { createdAt?: number; updatedAt?: number }).createdAt || (b as { updatedAt?: number }).updatedAt || 0);
      return bTime - aTime;
    });
};

export const subscribeToProjects = (callback: (projects: PortfolioProject[]) => void) =>
  onValue(ref(db, 'projects'), (snapshot) => callback(snapshotToList<PortfolioProject>(snapshot.val())));

export const subscribeToCertificates = (callback: (certificates: Certificate[]) => void) =>
  onValue(ref(db, 'certificates'), (snapshot) => callback(snapshotToList<Certificate>(snapshot.val())));

export const subscribeToResume = (callback: (resume: ResumeProfile | null) => void) =>
  onValue(ref(db, 'resume/current'), (snapshot) => callback(snapshot.val()));

export const subscribeToMessages = (callback: (messages: ContactMessage[]) => void) =>
  onValue(ref(db, 'messages'), (snapshot) => callback(snapshotToList<ContactMessage>(snapshot.val())));

export const subscribeToRepoRequests = (callback: (requests: RepoRequest[]) => void) =>
  onValue(ref(db, 'repoRequests'), (snapshot) => callback(snapshotToList<RepoRequest>(snapshot.val())));

export const submitContactMessage = (message: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>) =>
  push(ref(db, 'messages'), {
    ...message,
    status: 'new',
    createdAt: serverTimestamp(),
  });

export const submitRepoRequest = (request: Omit<RepoRequest, 'id' | 'status' | 'createdAt'>) =>
  push(ref(db, 'repoRequests'), {
    ...request,
    status: 'pending',
    createdAt: serverTimestamp(),
  });

export const saveProject = (project: Omit<PortfolioProject, 'id' | 'updatedAt'>, id?: string) => {
  const projectRef = id ? ref(db, `projects/${id}`) : push(ref(db, 'projects'));
  return set(projectRef, {
    ...project,
    updatedAt: serverTimestamp(),
  });
};

export const saveCertificate = (certificate: Omit<Certificate, 'id'>, id?: string) => {
  const certificateRef = id ? ref(db, `certificates/${id}`) : push(ref(db, 'certificates'));
  return set(certificateRef, certificate);
};

export const updateMessage = (id: string, data: Partial<ContactMessage>) => update(ref(db, `messages/${id}`), data);
export const updateRepoRequest = (id: string, data: Partial<RepoRequest>) => update(ref(db, `repoRequests/${id}`), data);
export const deleteProject = (id: string) => remove(ref(db, `projects/${id}`));
export const deleteCertificate = (id: string) => remove(ref(db, `certificates/${id}`));
export const deleteMessage = (id: string) => remove(ref(db, `messages/${id}`));
export const deleteRepoRequest = (id: string) => remove(ref(db, `repoRequests/${id}`));

export const uploadAsset = async (folder: 'projects' | 'certificates' | 'resume', file: File) => {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `${folder}/${Date.now()}-${safeName}`;
  const targetRef = storageRef(storage, path);
  await uploadBytes(targetRef, file);
  return getDownloadURL(targetRef);
};

export const saveResume = (resume: ResumeProfile) =>
  set(ref(db, 'resume/current'), {
    ...resume,
    updatedAt: serverTimestamp(),
  });

export const subscribeToLeaderboard = (gameId: string, callback: (entries: LeaderboardEntry[]) => void) =>
  onValue(ref(db, `leaderboard/${gameId}`), (snapshot) => {
    const data = snapshot.val();
    if (!data) return callback([]);
    const list = Object.entries(data as Record<string, Omit<LeaderboardEntry, 'id'>>)
      .map(([id, item]) => ({ id, ...item }) as LeaderboardEntry)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    callback(list);
  });

export const submitHighScore = (gameId: string, name: string, score: number) => {
  return push(ref(db, `leaderboard/${gameId}`), {
    name,
    score,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToStoreProducts = (callback: (products: StoreProject[]) => void) =>
  onValue(ref(db, 'storeProducts'), (snapshot) => callback(snapshotToList<StoreProject>(snapshot.val())));

export const subscribeToOrders = (callback: (orders: Order[]) => void) =>
  onValue(ref(db, 'orders'), (snapshot) => callback(snapshotToList<Order>(snapshot.val())));

export const saveStoreProduct = (product: Omit<StoreProject, 'id' | 'updatedAt'>, id?: string) => {
  const productRef = id ? ref(db, `storeProducts/${id}`) : push(ref(db, 'storeProducts'));
  return set(productRef, {
    ...product,
    updatedAt: serverTimestamp(),
  });
};

export const deleteStoreProduct = (id: string) => remove(ref(db, `storeProducts/${id}`));

export const createOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
  return push(ref(db, 'orders'), {
    ...order,
    createdAt: serverTimestamp(),
  });
};

export const updateOrder = (id: string, data: Partial<Order>) => update(ref(db, `orders/${id}`), data);
export const deleteOrder = (id: string) => remove(ref(db, `orders/${id}`));

