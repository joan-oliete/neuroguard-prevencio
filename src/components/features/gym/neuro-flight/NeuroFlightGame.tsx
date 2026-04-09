import React, { useState } from 'react';
import { FlightGameProvider, useFlightGameContext } from './FlightGameContext';
import { ShaderCanvas } from './components/ShaderCanvas';
import { ShipOverlay } from './components/ShipOverlay';
import { FlightControls } from './components/FlightControls';
import { ArrowLeft, Maximize2, MonitorPlay } from 'lucide-react';

interface GameProps {
    onExit: () => void;
}

const NeuroFlightContent: React.FC<GameProps> = ({ onExit }) => {
    const {
        activeShaderCode,
        uniforms,
        cameraRef,
        isHdEnabled,
        setIsHdEnabled,
        viewMode,
        setViewMode
    } = useFlightGameContext();

    const [error, setError] = useState<string | null>(null);

    return (
        <div className="relative w-full h-full bg-black overflow-hidden select-none">
            {/* Layers */}
            <div className="absolute inset-0 z-0">
                <ShaderCanvas
                    fragmentSrc={activeShaderCode}
                    uniforms={uniforms}
                    onError={(err) => setError(err)}
                    cameraRef={cameraRef}
                    isHdEnabled={isHdEnabled}
                    isFpsEnabled={false}
                    isPlaying={true}
                    shouldReduceQuality={false}
                />
            </div>

            <div className="absolute inset-0 z-10 pointer-events-none">
                <ShipOverlay />
            </div>

            {/* UI Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4">
                {/* Header */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <button
                        className="p-2 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white rounded-full border border-white/10 flex items-center justify-center transition-colors"
                        onClick={onExit}
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    <div className="flex gap-2">
                        <button
                            className={`p-2 rounded-full border border-white/10 transition-colors flex items-center justify-center ${viewMode === 'cockpit' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-black/40 text-white'}`}
                            onClick={() => setViewMode('cockpit')}
                            title="Cockpit View"
                        >
                            <Maximize2 className="w-5 h-5" />
                        </button>
                        <button
                            className={`p-2 rounded-full border border-white/10 transition-colors flex items-center justify-center ${viewMode === 'chase' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-black/40 text-white'}`}
                            onClick={() => setViewMode('chase')}
                            title="Chase View"
                        >
                            <MonitorPlay className="w-5 h-5" />
                        </button>
                        <button
                            className={`px-3 py-1 rounded-full border border-white/10 transition-colors font-mono text-xs ${isHdEnabled ? 'bg-purple-500/20 text-purple-300' : 'bg-black/40 text-gray-400'}`}
                            onClick={() => setIsHdEnabled(!isHdEnabled)}
                        >
                            {isHdEnabled ? 'HD' : 'SD'}
                        </button>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-500/80 backdrop-blur text-white p-4 rounded-lg pointer-events-auto mx-auto max-w-md">
                        <h3 className="font-bold mb-1">Shader Error</h3>
                        <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-32">{error}</pre>
                    </div>
                )}
            </div>

            {/* Controls */}
            <FlightControls />
        </div>
    );
};

export const NeuroFlightGame: React.FC<GameProps> = (props) => {
    return (
        <FlightGameProvider>
            <NeuroFlightContent {...props} />
        </FlightGameProvider>
    );
};
