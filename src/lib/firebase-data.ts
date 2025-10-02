
"use client"

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  Firestore,
} from 'firebase/firestore';
import type { Client, Project, User, WeeklyReport } from './types';

// --- USERS ---
export const getUsers = async (db: Firestore): Promise<User[]> => {
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  return userList;
};

export const getUserById = async (db: Firestore, id: string): Promise<User | undefined> => {
  if (!id) return undefined;
  const userDoc = await getDoc(doc(db, 'users', id));
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() } as User;
  }
  return undefined;
};

export const getProjectById = async (db: Firestore, projectId: string): Promise<Project | null> => {
    if (!projectId) return null;
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return null;
    return { id: projectSnap.id, ...projectSnap.data() } as Project;
};

export const getClientById = async (db: Firestore, clientId: string): Promise<Client | null> => {
    if (!clientId) return null;
    const clientRef = doc(db, 'clients', clientId);
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) return null;
    return { id: clientSnap.id, ...clientSnap.data() } as Client;
};

// --- MILESTONES ---
// getMilestones function removed

// --- WEEKLY REPORTS ---
export const getReport = async (db: Firestore, projectId: string, reportId: string): Promise<WeeklyReport | undefined> => {
  const reportDoc = await getDoc(doc(db, `projects/${projectId}/weeklyReports`, reportId));
  if (reportDoc.exists()) {
    return reportDoc.data() as WeeklyReport;
  }
  return undefined;
};

export const getOrCreateReport = async (db: Firestore, projectId: string, reportNumber: number): Promise<WeeklyReport> => {
    // This function is less relevant now that we create reports with unique IDs,
    // but can be kept for creating the initial object structure for a new report.
    return {
        projectId,
        week: reportNumber,
        summary: '',
        status: 'On Track',
        milestones: [],
        progress: 0,
        createdAt: new Date().toISOString(),
    };
};
