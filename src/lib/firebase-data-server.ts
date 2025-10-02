
// This file is exclusively for server-side Firebase data fetching.
// It uses the Admin SDK, which has full access to the database.
import 'server-only';

import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import type { Client, Project, User, WeeklyReport } from './types';

function getAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0]!;
  }
  // If no app is initialized, it assumes it's running in an environment
  // where GOOGLE_APPLICATION_CREDENTIALS is set.
  return initializeApp();
}

export const getProjectById = async (projectId: string): Promise<Project | null> => {
    const db = getFirestore(getAdminApp());
    const projectRef = db.collection('projects').doc(projectId);
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists) return null;
    return { id: projectSnap.id, ...projectSnap.data() } as Project;
};

export const getClientById = async (clientId: string): Promise<Client | null> => {
    const db = getFirestore(getAdminApp());
    const clientRef = db.collection('clients').doc(clientId);
    const clientSnap = await clientRef.get();
    if (!clientSnap.exists) return null;
    return { id: clientSnap.id, ...clientSnap.data() } as Client;
};

export const getUserById = async (userId: string): Promise<User | null> => {
    const db = getFirestore(getAdminApp());
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) return null;
    return { id: userSnap.id, ...userSnap.data() } as User;
};

export const getReportsForProject = async (projectId: string): Promise<WeeklyReport[]> => {
    const db = getFirestore(getAdminApp());
    const reportsRef = db.collection('projects').doc(projectId).collection('weeklyReports');
    const reportsSnap = await reportsRef.orderBy('week', 'asc').get();
    return reportsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeeklyReport));
};
