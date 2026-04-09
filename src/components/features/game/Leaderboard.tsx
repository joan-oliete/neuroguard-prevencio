import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, User, Crown, Medal, TrendingUp } from 'lucide-react';
import { db, collection, query, orderBy, limit, getDocs } from '../../../services/firebase';
import { useAuth } from '../../../context/AuthContext';

interface LeaderboardProps {
    gameId: string;
    gameName: string;
}

interface ScoreEntry {
    id: string;
    uid: string;
    name: string;
    score: number;
    createdAt: any;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ gameId, gameName }) => {
    const { user } = useAuth();
    const [scores, setScores] = useState<ScoreEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFrame, setTimeFrame] = useState<'all' | 'weekly'>('all');

    useEffect(() => {
        const fetchScores = async () => {
            setLoading(true);
            try {
                // Construct query
                // Note: For 'weekly', we would need a 'where' clause on createdAt, 
                // but that requires specific indexing. For MVP, we stick to 'all-time'.
                const q = query(
                    collection(db, `leaderboards/${gameId}/scores`),
                    orderBy('score', 'desc'),
                    limit(20) // Top 20
                );

                const snapshot = await getDocs(q);
                const fetchedScores = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as ScoreEntry[];

                setScores(fetchedScores);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchScores();
    }, [gameId, timeFrame]);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 0: return <Crown className="text-yellow-400 fill-yellow-400" size={24} />;
            case 1: return <Medal className="text-slate-300 fill-slate-300" size={24} />;
            case 2: return <Medal className="text-amber-600 fill-amber-600" size={24} />;
            default: return <span className="font-bold text-slate-500 w-6 text-center">{rank + 1}</span>;
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy size={120} />
                </div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Trophy className="text-yellow-400" />
                        Rànquing Global
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Top jugadors de: <span className="text-brand-300 font-bold">{gameName}</span>
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex p-2 bg-slate-50 border-b border-slate-200 gap-2">
                <button
                    onClick={() => setTimeFrame('all')}
                    className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${timeFrame === 'all' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                    Tot el temps
                </button>
                <button
                    onClick={() => setTimeFrame('weekly')}
                    className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${timeFrame === 'weekly' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                    Aquesta Setmana (Pro)
                </button>
            </div>

            {/* List */}
            <div className="p-0">
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                    </div>
                ) : scores.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Encara no hi ha puntuacions. Sigues el primer!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {scores.map((entry, index) => {
                            const isMe = user?.uid === entry.uid;
                            return (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors ${isMe ? 'bg-brand-50 hover:bg-brand-100/50' : ''}`}
                                >
                                    <div className="w-8 flex justify-center shrink-0">
                                        {getRankIcon(index)}
                                    </div>

                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 border-2 border-white shadow-sm">
                                        <User size={20} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`font-bold truncate ${isMe ? 'text-brand-700' : 'text-slate-700'}`}>
                                            {entry.name || 'Agent Anònim'} {isMe && '(Tu)'}
                                        </p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar size={10} />
                                            {entry.createdAt?.toDate ? new Date(entry.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-mono font-bold text-lg text-slate-800">
                                            {entry.score.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">PTS</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
