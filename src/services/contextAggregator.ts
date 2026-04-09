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
        highScores: Record<string, number>; // GameID -> Score
    };
    inferredState: {
        anxietyLevel: 'low' | 'medium' | 'high' | 'unknown';
        needsEncouragement: boolean;
    };
}

const GAMES = ['impulse_control', 'neuro_runner', 'zen_puzzle'];

export const getUserContext = async (userProfile: UserProfile): Promise<UserContextData> => {
    const context: UserContextData = {
        profile: {
            name: userProfile.name,
            level: userProfile.level,
            streak: userProfile.streak,
            type: userProfile.type
        },
        recentActivity: {
            diaryCountToday: 0,
            highScores: {}
        },
        inferredState: {
            anxietyLevel: 'unknown',
            needsEncouragement: false
        }
    };

    try {
        // 1. Fetch Diary Stats (Are they active today?)
        // query: users/{uid}/diaryEntries where createdAt > todayStart? 
        // Simpler: Just fetch last 5 and check dates.
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

        // 2. Fetch High Scores for each game
        // Note: This does N queries. Acceptable for now (3 games).
        for (const gameId of GAMES) {
            try {
                // Try to get MY best score
                // Requires composite index: uid ASC, score DESC
                // We'll try just filtering by UID and doing client-side max to avoid index block for now if easy
                const scoreQ = query(
                    collection(db, `leaderboards/${gameId}/scores`),
                    where('uid', '==', userProfile.id),
                    limit(5) // Get recent 5
                );

                const scoreSnap = await getDocs(scoreQ);
                if (!scoreSnap.empty) {
                    const scores = scoreSnap.docs.map(d => d.data().score as number);
                    const maxScore = Math.max(...scores);
                    context.recentActivity.highScores[gameId] = maxScore;
                }
            } catch (err) {
                console.warn(`Could not fetch scores for ${gameId}`, err);
            }
        }

        // 3. Infer State
        // Logic: Low streak (<2) or no diary today might indicate 'medium' need.
        // Logic: High level but low streak?

        let anxiety: 'low' | 'medium' | 'high' = 'low';

        if (userProfile.streak < 2) anxiety = 'medium';
        if (context.recentActivity.diaryCountToday === 0 && userProfile.streak === 0) anxiety = 'high';

        // Override if we have real mood tracking later.

        context.inferredState.anxietyLevel = anxiety;
        context.inferredState.needsEncouragement = anxiety !== 'low';

    } catch (error) {
        console.error("Error building user context:", error);
    }

    return context;
};
