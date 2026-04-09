import React, { useState, useRef } from 'react';
import { useFlightGameContext } from '../FlightGameContext';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const DpadButton: React.FC<{
    onPress: () => void;
    onRelease: () => void;
    children: React.ReactNode;
    className?: string;
    ariaLabel: string;
    isKeyPressed?: boolean;
}> = ({ onPress, onRelease, children, className = '', ariaLabel, isKeyPressed = false }) => {
    const [isPointerPressed, setIsPointerPressed] = useState(false);
    const activePointerId = useRef<number | null>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (activePointerId.current !== null) return;
        try { (e.target as Element).setPointerCapture(e.pointerId); } catch (err) { }
        activePointerId.current = e.pointerId;
        setIsPointerPressed(true);
        onPress();
    };

    const handlePointerUpOrCancel = (e: React.PointerEvent) => {
        if (activePointerId.current === e.pointerId) {
            activePointerId.current = null;
            setIsPointerPressed(false);
            onRelease();
        }
    };

    const isVisuallyPressed = isPointerPressed || isKeyPressed;

    return (
        <div
            role="button"
            aria-label={ariaLabel}
            className={`w-12 h-12 md:w-16 md:h-16 bg-gray-500/30 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-100 ease-in-out select-none touch-none ${className} ${isVisuallyPressed ? 'bg-white/40 scale-90' : ''}`}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUpOrCancel}
            onPointerCancel={handlePointerUpOrCancel}
            onLostPointerCapture={handlePointerUpOrCancel}
        >
            {children}
        </div>
    );
};

export const FlightControls: React.FC = () => {
    const { pressKey, releaseKey, pressedKeys } = useFlightGameContext();

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 flex justify-between items-end pointer-events-none z-30 select-none">
            {/* Left Side: Movement */}
            <div className="pointer-events-auto">
                <div className="grid grid-cols-3 grid-rows-3 w-32 h-32 md:w-48 md:h-48">
                    <div className="col-start-2 row-start-1 flex justify-center items-center">
                        <DpadButton onPress={() => pressKey('w')} onRelease={() => releaseKey('w')} ariaLabel="Move Forward" isKeyPressed={pressedKeys.has('w')}><ChevronUp size={32} /></DpadButton>
                    </div>
                    <div className="col-start-1 row-start-2 flex justify-center items-center">
                        <DpadButton onPress={() => pressKey('a')} onRelease={() => releaseKey('a')} ariaLabel="Move Left" isKeyPressed={pressedKeys.has('a')}><ChevronLeft size={32} /></DpadButton>
                    </div>
                    <div className="col-start-3 row-start-2 flex justify-center items-center">
                        <DpadButton onPress={() => pressKey('d')} onRelease={() => releaseKey('d')} ariaLabel="Move Right" isKeyPressed={pressedKeys.has('d')}><ChevronRight size={32} /></DpadButton>
                    </div>
                    <div className="col-start-2 row-start-3 flex justify-center items-center">
                        <DpadButton onPress={() => pressKey('s')} onRelease={() => releaseKey('s')} ariaLabel="Move Backward" isKeyPressed={pressedKeys.has('s')}><ChevronDown size={32} /></DpadButton>
                    </div>
                </div>
            </div>

            {/* Right Side: LOOK / Rotation */}
            <div className="pointer-events-auto">
                <div className="grid grid-cols-3 grid-rows-3 w-32 h-32 md:w-48 md:h-48">
                    <div className="col-start-2 row-start-1 flex justify-center items-center">
                        <DpadButton onPress={() => pressKey('arrowup')} onRelease={() => releaseKey('arrowup')} ariaLabel="Look Up" isKeyPressed={pressedKeys.has('arrowup')}><ChevronUp size={32} /></DpadButton>
                    </div>
                    <div className="col-start-1 row-start-2 flex justify-center items-center">
                        <DpadButton onPress={() => pressKey('arrowleft')} onRelease={() => releaseKey('arrowleft')} ariaLabel="Look Left" isKeyPressed={pressedKeys.has('arrowleft')}><ChevronLeft size={32} /></DpadButton>
                    </div>
                    <div className="col-start-3 row-start-2 flex justify-center items-center">
                        <DpadButton onPress={() => pressKey('arrowright')} onRelease={() => releaseKey('arrowright')} ariaLabel="Look Right" isKeyPressed={pressedKeys.has('arrowright')}><ChevronRight size={32} /></DpadButton>
                    </div>
                    <div className="col-start-2 row-start-3 flex justify-center items-center">
                        <DpadButton onPress={() => pressKey('arrowdown')} onRelease={() => releaseKey('arrowdown')} ariaLabel="Look Down" isKeyPressed={pressedKeys.has('arrowdown')}><ChevronDown size={32} /></DpadButton>
                    </div>
                </div>
            </div>
        </div>
    );
};
