import { useState, useEffect } from 'react';
import { CapacitorPedometer } from '@capgo/capacitor-pedometer';
import { Capacitor } from '@capacitor/core';

export const usePedometer = () => {
    const [steps, setSteps] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) {
            console.log('Pedometer is only available on native platforms');
            return;
        }

        let listener: any = null;

        const init = async () => {
            try {
                // Many Capacitor plugins have a permissions request phase.
                // Depending on the plugin version, `start()` may ask automatically.
                await CapacitorPedometer.start();
                setIsActive(true);

                listener = await CapacitorPedometer.addListener('step', (data: any) => {
                    // Actual pedometer plugins return total steps globally or since start.
                    // We take the safest route by assuming 'numberOfSteps'.
                    if (data && data.numberOfSteps !== undefined) {
                        setSteps(data.numberOfSteps);
                    } else {
                        setSteps(prev => prev + 1);
                    }
                });
            } catch (e) {
                console.error('Pedometer init error:', e);
                setIsActive(false);
            }
        };

        init();

        return () => {
            if (listener) {
                listener.remove();
            }
            if (isActive) {
                CapacitorPedometer.stop().catch(console.error);
            }
        };
    }, []);

    return { steps, isActive };
};
