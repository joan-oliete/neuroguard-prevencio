import { useState, useEffect } from 'react';
import { db, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from '../services/firebase';
import { DiaryEntry } from '../types';
import { User } from 'firebase/auth';

/**
 * Custom hook to manage diary entries and operations.
 * @param user The current authenticated user.
 * @returns List of diary entries and an addEntry function.
 */
export const useDiary = (user: User | null) => {
    const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
    const [diaryLoading, setDiaryLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setDiaryEntries([]);
            setDiaryLoading(false);
            return;
        }

        setDiaryLoading(true);
        const q = query(collection(db, `users/${user.uid}/diaryEntries`), orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (snap) => {
            const entries = snap.docs.map(d => ({ id: d.id, ...d.data() } as DiaryEntry));
            setDiaryEntries(entries);
            setDiaryLoading(false);
        }, (error) => {
            console.error("Error fetching diary entries:", error);
            setDiaryLoading(false);
        });

        return unsubscribe;
    }, [user]);

    const addDiaryEntry = async (text: string, linkedActivity?: { date: string, area: string }) => {
        if (!user || !text.trim()) return;

        const entryData: any = {
            text: text,
            createdAt: serverTimestamp(),
        };

        if (linkedActivity) {
            entryData.linkedActivity = linkedActivity;
        }

        try {
            await addDoc(collection(db, `users/${user.uid}/diaryEntries`), entryData);
            return true;
        } catch (error) {
            console.error("Error adding diary entry:", error);
            return false;
        }
    };


    const hasEntryForToday = diaryEntries.some(entry => {
        if (!entry.createdAt?.toDate) return false;
        const entryDate = entry.createdAt.toDate();
        const today = new Date();
        return entryDate.getDate() === today.getDate() &&
            entryDate.getMonth() === today.getMonth() &&
            entryDate.getFullYear() === today.getFullYear();
    });

    return { diaryEntries, addDiaryEntry, diaryLoading, hasEntryForToday };
};

