// This file is exclusively for server-side Firebase actions.
// It should NOT have the 'use client' directive.
import 'server-only';

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  getFirestore,
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth as getFirebaseAuth } from 'firebase/auth'; // Renamed to avoid conflict
import { firebaseConfig } from '@/firebase/config';
import type { Client, Project, WeeklyReport } from './types';
import { headers } from 'next/headers';

// Helper function to initialize Firebase app on the server.
// It's memoized to avoid re-initialization on every call.
const getFirebaseServerApp = () => {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }
  return initializeApp(firebaseConfig);
};

// --- AUTH HELPERS for Server Actions ---
// This is a placeholder for getting the authenticated user's ID on the server.
// In a real app, you'd use your auth provider's server-side utilities,
// like verifying a session cookie. For now, this is a simplified placeholder.
export async function getAuthenticatedUser() {
    // In a real Firebase Auth scenario, you would typically verify an ID token
    // passed in the headers or a session cookie.
    // For this project, we'll rely on the client-side authentication status
    // which is a simplification for the current development phase.
    // This function can be expanded later to include server-side session management.
    // We throw an error to indicate that for production, this needs to be implemented.
    // However, for the actions that use it, we will assume they are called by an auth'd client.
    throw new Error("Server-side user authentication not fully implemented. This is a placeholder.");
}


// --- CLIENTS ---
export const addClient = async (clientData: Omit<Client, 'id'>) => {
  const db = getFirestore(getFirebaseServerApp());
  const clientsCol = collection(db, 'clients');
  await addDoc(clientsCol, clientData);
};

export const updateClient = async (id: string, updates: Partial<Client>) => {
  const db = getFirestore(getFirebaseServerApp());
  const clientRef = doc(db, 'clients', id);
  await updateDoc(clientRef, updates);
};

// --- PROJECTS ---
export const addProject = async (projectData: Omit<Project, 'id'>) => {
    const db = getFirestore(getFirebaseServerApp());
    const projectsCol = collection(db, 'projects');
    await addDoc(projectsCol, projectData);
};

export const updateProject = async (id: string, updates: Partial<Project>) => {
  const db = getFirestore(getFirebaseServerApp());
  const projectRef = doc(db, 'projects', id);
  await updateDoc(projectRef, updates);
};


// --- WEEKLY REPORTS ---
export const updateWeeklyReport = async (projectId: string, week: number, updates: Partial<Omit<WeeklyReport, 'projectId' | 'week'>>) => {
    const db = getFirestore(getFirebaseServerApp());
    const reportId = `week-${week}`;
    const reportRef = doc(db, `projects/${projectId}/weeklyReports`, reportId);

    const reportData = {
        projectId,
        week,
        createdAt: new Date().toISOString(),
        ...updates
    };
    await setDoc(reportRef, reportData, { merge: true });
};
