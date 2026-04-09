import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TheLoot from '../TheLoot';
import { Memory } from '@/types';

// Mock dependencies
// Removed AnimatedCard mock to rely on real component + framer-motion mock

// Mock icons
vi.mock('lucide-react', () => ({
    Camera: () => <span data-testid="icon-camera" />,
    Sparkles: () => <span data-testid="icon-sparkles" />,
    Loader2: () => <span data-testid="icon-loader" />,
    Trash2: () => <span data-testid="icon-trash" />,
    Save: () => <span data-testid="icon-save" />,
    ImageIcon: () => <span data-testid="icon-image" />,
    AlertCircle: () => <span data-testid="icon-alert" />
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Service
const mockGenerateMemoryImage = vi.fn();
vi.mock('@/services/geminiService', () => ({
    generateMemoryImage: (...args: any[]) => mockGenerateMemoryImage(...args)
}));

describe('TheLoot Component', () => {
    const mockUser: any = {
        id: 'test-uid',
        email: 'test@example.com',
        name: 'Test',
        surname: 'User',
        phone: '123456789',
        activeManualId: 'manual-1',
        lastConsumptionDate: null,
        createdAt: new Date(),
        type: 'adult',
        streak: 5,
        currency: 100,
        level: 1,
        // Legacy props or extras can be ignored if not in type, but casting to any simplifies avoiding strict checks for test mocks if types overlap
    };
    const mockMemories: Memory[] = [];
    const mockOnAddMemory = vi.fn();
    const mockOnDeleteMemory = vi.fn();

    it('renders correctly', () => {
        render(
            <TheLoot
                user={mockUser}
                memories={mockMemories}
                onAddMemory={mockOnAddMemory}
                onDeleteMemory={mockOnDeleteMemory}
            />
        );
        expect(screen.getByText('The Loot')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Ex: Un dia assolellat/i)).toBeInTheDocument();
    });

    it('handles input and generation trigger', async () => {
        render(
            <TheLoot
                user={mockUser}
                memories={mockMemories}
                onAddMemory={mockOnAddMemory}
                onDeleteMemory={mockOnDeleteMemory}
            />
        );

        const input = screen.getByPlaceholderText(/Ex: Un dia assolellat/i);
        const button = screen.getByText('Generar Art');

        // Type into input
        fireEvent.change(input, { target: { value: 'Happy memory' } });
        expect(input).toHaveValue('Happy memory');

        // Click generate
        mockGenerateMemoryImage.mockResolvedValue('http://fake-image.url');
        fireEvent.click(button);

        expect(screen.getByText('Somiant...')).toBeInTheDocument();

        await waitFor(() => {
            expect(mockGenerateMemoryImage).toHaveBeenCalledWith('Happy memory');
            expect(mockOnAddMemory).toHaveBeenCalledWith('Happy memory', 'http://fake-image.url');
        });
    });

    it('handles API error correctly', async () => {
        render(
            <TheLoot
                user={mockUser}
                memories={mockMemories}
                onAddMemory={mockOnAddMemory}
                onDeleteMemory={mockOnDeleteMemory}
            />
        );

        const input = screen.getByPlaceholderText(/Ex: Un dia assolellat/i);
        const button = screen.getByText('Generar Art');

        fireEvent.change(input, { target: { value: 'Fail memory' } });

        // Mock failure
        mockGenerateMemoryImage.mockResolvedValue(null);
        fireEvent.click(button);

        await waitFor(() => {
            // Should show error message
            expect(screen.getByText(/No s'ha pogut generar la imatge/i)).toBeInTheDocument();
            // Should show BYOK button
            expect(screen.getByText(/Tinc la meva pròpia clau API/i)).toBeInTheDocument();
        });
    });
});
