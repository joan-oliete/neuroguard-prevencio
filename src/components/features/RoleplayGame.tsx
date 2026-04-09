import React, { useState } from 'react';
import { RoleplayMenu } from './roleplay/RoleplayMenu';
import { SocialSimulation } from './roleplay/SocialSimulation';
import { CognitiveGame } from './roleplay/CognitiveGame';
import { ValuesGame } from './roleplay/ValuesGame';
import { FocusGame } from './roleplay/FocusGame';
import { AssociationGame } from './roleplay/AssociationGame';
import { EmotionalGame } from './roleplay/EmotionalGame';
import { BreathingGame } from './roleplay/BreathingGame';

type GameMode = 'menu' | 'roleplay' | 'cognitive' | 'values' | 'focus' | 'association' | 'emotional' | 'breathing';

interface RoleplayGameProps {
    onUpdateStats?: (points: number) => void;
}

const RoleplayGame: React.FC<RoleplayGameProps> = ({ onUpdateStats }) => {
    const [mode, setMode] = useState<GameMode>('menu');
    const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined);
    const [score, setScore] = useState(0);

    const handleModeSelect = (newMode: GameMode, topic?: string) => {
        if (topic) setSelectedTopic(topic);
        setMode(newMode);
    };

    const [showToast, setShowToast] = useState(false);
    const [lastPoints, setLastPoints] = useState(0);

    const handleScoreUpdate = (points: number) => {
        setScore(prev => prev + points);
        if (onUpdateStats) onUpdateStats(points);

        // Show Toast
        setLastPoints(points);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const renderContent = () => {
        switch (mode) {
            case 'menu':
                return <RoleplayMenu score={score} onSelectMode={handleModeSelect} />;
            case 'roleplay':
                return <SocialSimulation topic={selectedTopic} onExit={() => setMode('menu')} onScoreUpdate={handleScoreUpdate} />;
            case 'cognitive':
                return <CognitiveGame onExit={() => setMode('menu')} onScoreUpdate={handleScoreUpdate} />;
            case 'values':
                return <ValuesGame onExit={() => setMode('menu')} onScoreUpdate={handleScoreUpdate} />;
            case 'focus':
                return <FocusGame onExit={() => setMode('menu')} onScoreUpdate={handleScoreUpdate} />;
            case 'association':
                return <AssociationGame onExit={() => setMode('menu')} onScoreUpdate={handleScoreUpdate} />;
            case 'emotional':
                return <EmotionalGame onExit={() => setMode('menu')} onScoreUpdate={handleScoreUpdate} />;
            case 'breathing':
                return <BreathingGame onExit={() => setMode('menu')} onScoreUpdate={handleScoreUpdate} />;
            default:
                return <RoleplayMenu score={score} onSelectMode={setMode} />;
        }
    };

    return (
        <div className="w-full">
            {renderContent()}
            {showToast && (
                <div className="fixed top-24 right-8 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-2xl font-black shadow-xl animate-bounce z-50 flex items-center gap-2 border-4 border-white">
                    <span>+{lastPoints} XP</span>
                </div>
            )}
        </div>
    );
};

export default RoleplayGame;
