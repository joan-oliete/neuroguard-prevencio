
import React, { useEffect, useState } from 'react';
import { doc, getDoc, db, onSnapshot } from '../../services/firebase'; // Adjust path if needed
import ManualDashboard from './ManualDashboard';
import { RelapseManual } from '../../types';

interface ManualLoaderProps {
    manualId: string;
    userId: string;
    onNavigate?: (view: string) => void;
}

const ManualLoader: React.FC<ManualLoaderProps> = ({ manualId, userId, onNavigate }) => {
    const [manual, setManual] = useState<RelapseManual | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!manualId || !userId) {
            setLoading(false);
            return;
        }

        const manualRef = doc(db, `users/${userId}/manuals`, manualId);

        const unsubscribe = onSnapshot(manualRef, (docSnap) => {
            if (docSnap.exists()) {
                setManual({ id: docSnap.id, ...docSnap.data() } as RelapseManual);
            } else {
                setError("El manual no existeix.");
            }
            setLoading(false);
        }, (err) => {
            console.error(err);
            setError("Error carregant el manual.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, [manualId, userId]);

    if (loading) return <div className="p-8 text-center text-slate-500">Carregant manual...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!manual) return null;

    return <ManualDashboard manual={manual} manualId={manualId} userId={userId} onNavigate={onNavigate} />;
};

export default ManualLoader;
