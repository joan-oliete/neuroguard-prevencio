import { db, collection, query, where, orderBy, limit, getDocs } from './firebase';
import { UserProfile, DiaryEntry } from '../types';

export interface UserContextData {
    profile: {
        name: string;
        level: number;
        streak: number;
        type: string;
    };
    recentActivity: {
        lastDiaryDate?: Date;
        diaryCountToday: number;
    };
    inferredState: {
        anxietyLevel: 'low' | 'medium' | 'high' | 'unknown';
        needsEncouragement: boolean;
    };
}

export const getUserContext = async (userProfile: UserProfile): Promise<UserContextData> => {
    const context: UserContextData = {
        profile: {
            name: userProfile.name,
            level: userProfile.level,
            streak: userProfile.streak,
            type: userProfile.type
        },
        recentActivity: {
            diaryCountToday: 0
        },
        inferredState: {
            anxietyLevel: 'unknown',
            needsEncouragement: false
        }
    };

    try {
        // 1. Fetch Diary Stats (Are they active today?)
        const diaryQ = query(
            collection(db, `users/${userProfile.id}/diaryEntries`),
            orderBy('createdAt', 'desc'),
            limit(5)
        );
        const diarySnap = await getDocs(diaryQ);
        if (!diarySnap.empty) {
            const lastEntry = diarySnap.docs[0].data() as DiaryEntry;
            if (lastEntry.createdAt?.toDate) {
                context.recentActivity.lastDiaryDate = lastEntry.createdAt.toDate();

                // Check if today
                const today = new Date();
                const isToday = context.recentActivity.lastDiaryDate!.getDate() === today.getDate() &&
                    context.recentActivity.lastDiaryDate!.getMonth() === today.getMonth();
                if (isToday) context.recentActivity.diaryCountToday = 1; // Simplified
            }
        }

        // 2. Infer State
        // Logic: Low streak (<2) or no diary today might indicate 'medium' need.

        let anxiety: 'low' | 'medium' | 'high' = 'low';

        if (userProfile.streak < 2) anxiety = 'medium';
        if (context.recentActivity.diaryCountToday === 0 && userProfile.streak === 0) anxiety = 'high';

        context.inferredState.anxietyLevel = anxiety;
        context.inferredState.needsEncouragement = anxiety !== 'low';

    } catch (error) {
        console.error("Error building user context:", error);
    }

    return context;
};
