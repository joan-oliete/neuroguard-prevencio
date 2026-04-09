
import { useEffect } from 'react';

export const GlobalErrorLogger = () => {
    useEffect(() => {
        const handleError = (event: ErrorEvent) => {
            alert(`Global Error: ${event.message} \n at ${event.filename}:${event.lineno}`);
        };

        const handleRejection = (event: PromiseRejectionEvent) => {
            alert(`Unhandled Rejection: ${event.reason}`);
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
        };
    }, []);

    return null;
}
