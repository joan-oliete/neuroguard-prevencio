import React, { createContext, useContext, useState, useEffect } from 'react';
import { Location, MOCK_LOCATIONS } from '../data/mapData';
import { useAuth } from './AuthContext';
import { db, collection, onSnapshot, addDoc, deleteDoc, doc } from '../services/firebase';

interface MapContextType {
    locations: Location[];
    addLocation: (location: Omit<Location, 'id'>) => void;
    removeLocation: (id: string) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [locations, setLocations] = useState<Location[]>([]);

    // Load initial state for unauthenticated users or before auth loads
    useEffect(() => {
        if (!user) {
            const saved = localStorage.getItem('neuroguard_map_locations');
            setLocations(saved ? JSON.parse(saved) : MOCK_LOCATIONS);
        }
    }, [user]);

    // Firestore Sync & Migration
    useEffect(() => {
        if (!user) return;

        const colRef = collection(db, 'users', user.uid, 'locations');
        let isMigrationChecked = false;

        const unsubscribe = onSnapshot(colRef, async (snapshot) => {
            const cloudData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));

            // Migration: If cloud is empty, upload local data or mocks
            if (!isMigrationChecked && snapshot.empty) {
                isMigrationChecked = true; // Prevent loop
                console.log("Starting Map Migration to Cloud...");

                const saved = localStorage.getItem('neuroguard_map_locations');
                const dataToMigrate = saved ? JSON.parse(saved) : MOCK_LOCATIONS;

                for (const loc of dataToMigrate) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...data } = loc; // Exclude ID, let Firestore generate it
                    await addDoc(colRef, data);
                }
                localStorage.removeItem('neuroguard_map_locations');
            } else {
                setLocations(cloudData);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const addLocation = async (newLoc: Omit<Location, 'id'>) => {
        if (user) {
            await addDoc(collection(db, 'users', user.uid, 'locations'), newLoc);
        } else {
            // Local fallback
            const id = Date.now().toString();
            const updated = [...locations, { ...newLoc, id }];
            setLocations(updated);
            localStorage.setItem('neuroguard_map_locations', JSON.stringify(updated));
        }
    };

    const removeLocation = async (id: string) => {
        if (user) {
            await deleteDoc(doc(db, 'users', user.uid, 'locations', id));
        } else {
            // Local fallback
            const updated = locations.filter(loc => loc.id !== id);
            setLocations(updated);
            localStorage.setItem('neuroguard_map_locations', JSON.stringify(updated));
        }
    };

    return (
        <MapContext.Provider value={{ locations, addLocation, removeLocation }}>
            {children}
        </MapContext.Provider>
    );
};

export const useMapData = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMapData must be used within a MapProvider');
    }
    return context;
};
