import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, Timestamp, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "api-key-placeholder",
  authDomain: "project-id.firebaseapp.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "sender-id",
  appId: "app-id"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface Evaluation {
  rating: number;
  timestamp: Timestamp;
  date: string; // YYYY-MM-DD
}

export async function addEvaluation(rating: number) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  
  return addDoc(collection(db, "evaluations"), {
    rating,
    timestamp: Timestamp.fromDate(now),
    date: dateStr,
  });
}

export async function getDailyEvaluations(dateStr?: string) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0];
  const q = query(
    collection(db, "evaluations"),
    where("date", "==", targetDate)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Evaluation);
}

export async function getAllEvaluations() {
  const q = query(collection(db, "evaluations"), orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Evaluation);
}