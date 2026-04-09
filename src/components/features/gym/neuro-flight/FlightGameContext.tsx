import React, { createContext, useContext, ReactNode } from 'react';
import { useFlightStore } from './hooks/useFlightStore';

type FlightGameContextType = ReturnType<typeof useFlightStore>;

const FlightGameContext = createContext<FlightGameContextType | null>(null);

export const FlightGameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const store = useFlightStore();
    return (
        <FlightGameContext.Provider value={store}>
            {children}
        </FlightGameContext.Provider>
    );
};

export const useFlightGameContext = () => {
    const context = useContext(FlightGameContext);
    if (!context) {
        throw new Error("useFlightGameContext must be used within a FlightGameProvider");
    }
    return context;
};
