import type { PetFilters } from '@pawfectmatch/core';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdvancedPetFilters } from '../AdvancedPetFilters';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        form: ({ children, ...props }: React.ComponentProps<'form'>) => <form {...props}>{children}</form>,
        div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
    },
}));

describe('AdvancedPetFilters (Web)', () => {
    const mockOnChange = jest.fn();
    const mockOnReset = jest.fn();
    const mockOnApply = jest.fn();

    const defaultFilters: PetFilters = {
        maxDistance: 50,
        personalityTags: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders all filter sections with proper headings', () => {
            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            expect(screen.getByRole('search', { name: 'Advanced pet filters' })).toBeInTheDocument();
            expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
            expect(screen.getByText('Find your perfect match')).toBeInTheDocument();
            expect(screen.getByLabelText('Species')).toBeInTheDocument();
            expect(screen.getByLabelText('Min Age')).toBeInTheDocument();
            expect(screen.getByLabelText('Max Age')).toBeInTheDocument();
            expect(screen.getByLabelText('Size')).toBeInTheDocument();
            expect(screen.getByLabelText('Intent')).toBeInTheDocument();
            expect(screen.getByText('Personality Tags')).toBeInTheDocument();
        });

        it('displays current filter values correctly', () => {
            const filtersWithValues: PetFilters = {
                species: 'dog',
                minAge: 2,
                maxAge: 8,
                size: 'medium',
                intent: 'adoption',
                maxDistance: 25,
                personalityTags: ['Friendly', 'Playful'],
            };

            render(
                <AdvancedPetFilters
                    value={filtersWithValues}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            expect(screen.getByDisplayValue('dog')).toBeInTheDocument();
            expect(screen.getByDisplayValue('2')).toBeInTheDocument();
            expect(screen.getByDisplayValue('8')).toBeInTheDocument();
            expect(screen.getByDisplayValue('medium')).toBeInTheDocument();
            expect(screen.getByDisplayValue('adoption')).toBeInTheDocument();
            expect(screen.getByDisplayValue('25')).toBeInTheDocument();
        });
    });

    describe('Species Filter', () => {
        it('calls onChange when species is selected', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            const speciesSelect = screen.getByLabelText('Species');
            await user.selectOptions(speciesSelect, 'cat');

            expect(mockOnChange).toHaveBeenCalledWith({
                ...defaultFilters,
                species: 'cat',
            });
        });

        it('shows help text for species selection', () => {
            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            expect(screen.getByText('Choose the type of pet you\'re looking for')).toBeInTheDocument();
        });
    });

    describe('Age Range Filter', () => {
        it('updates min age correctly', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            const minAgeInput = screen.getByLabelText('Min Age');
            await user.clear(minAgeInput);
            await user.type(minAgeInput, '3');

            expect(mockOnChange).toHaveBeenCalledWith({
                ...defaultFilters,
                minAge: 3,
            });
        });

        it('updates max age correctly', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            const maxAgeInput = screen.getByLabelText('Max Age');
            await user.clear(maxAgeInput);
            await user.type(maxAgeInput, '10');

            expect(mockOnChange).toHaveBeenCalledWith({
                ...defaultFilters,
                maxAge: 10,
            });
        });

        it('handles empty age input correctly', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedPetFilters
                    value={{ ...defaultFilters, minAge: 5 }}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            const minAgeInput = screen.getByLabelText('Min Age');
            await user.clear(minAgeInput);

            expect(mockOnChange).toHaveBeenCalledWith({
                ...defaultFilters,
                minAge: undefined,
            });
        });

        it('shows age range help text', () => {
            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            expect(screen.getByText('Age range in years (0-20)')).toBeInTheDocument();
        });
    });

    describe('Size Filter', () => {
        it('updates size preference correctly', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            const sizeSelect = screen.getByLabelText('Size');
            await user.selectOptions(sizeSelect, 'large');

            expect(mockOnChange).toHaveBeenCalledWith({
                ...defaultFilters,
                size: 'large',
            });
        });
    });

    describe('Intent Filter', () => {
        it('updates intent correctly', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            const intentSelect = screen.getByLabelText('Intent');
            await user.selectOptions(intentSelect, 'mating');

            expect(mockOnChange).toHaveBeenCalledWith({
                ...defaultFilters,
                intent: 'mating',
            });
        });
    });

    describe('Distance Slider', () => {
        it('updates distance when slider value changes', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            const distanceSlider = screen.getByRole('slider');
            fireEvent.change(distanceSlider, { target: { value: '75' } });

            expect(mockOnChange).toHaveBeenCalledWith({
                ...defaultFilters,
                maxDistance: 75,
            });
        });

        it('displays current distance value', () => {
            render(
                <AdvancedPetFilters
                    value={{ ...defaultFilters, maxDistance: 30 }}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            expect(screen.getByText('Max Distance: 30 km')).toBeInTheDocument();
        });

        it('shows distance range labels', () => {
            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            expect(screen.getByText('1 km')).toBeInTheDocument();
            expect(screen.getByText('100 km')).toBeInTheDocument();
        });
    });

    describe('Personality Tags', () => {
        it('toggles personality tags correctly', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            const friendlyTag = screen.getByRole('button', { name: 'Add Friendly personality tag' });
            await user.click(friendlyTag);

            expect(mockOnChange).toHaveBeenCalledWith({
                ...defaultFilters,
                personalityTags: ['Friendly'],
            });
        });

        it('removes selected personality tags', async () => {
            const user = userEvent.setup();
            const filtersWithTags: PetFilters = {
                ...defaultFilters,
                personalityTags: ['Friendly', 'Playful'],
            };

            render(
                <AdvancedPetFilters
                    value={filtersWithTags}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            const friendlyTag = screen.getByRole('button', { name: 'Remove Friendly personality tag' });
            await user.click(friendlyTag);

            expect(mockOnChange).toHaveBeenCalledWith({
                ...filtersWithTags,
                personalityTags: ['Playful'],
            });
        });

        it('shows personality tag count', () => {
            const filtersWithTags: PetFilters = {
                ...defaultFilters,
                personalityTags: ['Friendly', 'Playful', 'Energetic'],
            };

            render(
                <AdvancedPetFilters
                    value={filtersWithTags}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            expect(screen.getByText('Select personality traits you prefer (3 selected)')).toBeInTheDocument();
        });

        it('shows correct aria-pressed state for selected tags', () => {
            const filtersWithTags: PetFilters = {
                ...defaultFilters,
                personalityTags: ['Friendly'],
            };

            render(
                <AdvancedPetFilters
                    value={filtersWithTags}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            const friendlyTag = screen.getByRole('button', { name: 'Remove Friendly personality tag' });
            const playfulTag = screen.getByRole('button', { name: 'Add Playful personality tag' });

            expect(friendlyTag).toHaveAttribute('aria-pressed', 'true');
            expect(playfulTag).toHaveAttribute('aria-pressed', 'false');
        });
    });

    describe('Action Buttons', () => {
        it('calls onReset when reset button is clicked', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            const resetButton = screen.getByRole('button', { name: 'Reset all filters to default' });
            await user.click(resetButton);

            expect(mockOnReset).toHaveBeenCalledTimes(1);
        });

        it('calls onApply when apply button is clicked', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            const applyButton = screen.getByRole('button', { name: 'Apply selected filters' });
            await user.click(applyButton);

            expect(mockOnApply).toHaveBeenCalledTimes(1);
        });

        it('does not render buttons when callbacks are not provided', () => {
            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                />
            );

            expect(screen.queryByRole('button', { name: 'Reset all filters to default' })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: 'Apply selected filters' })).not.toBeInTheDocument();
        });
    });

    describe('Keyboard Navigation', () => {
        it('supports escape key to reset filters', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            await user.keyboard('{Escape}');

            expect(mockOnReset).toHaveBeenCalledTimes(1);
        });

        it('supports ctrl+enter to apply filters', async () => {
            const user = userEvent.setup();

            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            await user.keyboard('{Control>}{Enter}{/Control}');

            expect(mockOnApply).toHaveBeenCalledTimes(1);
        });

        it('shows keyboard shortcuts help text', () => {
            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            expect(screen.getByText(/Press .* to reset/)).toBeInTheDocument();
            expect(screen.getByText(/to apply/)).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA labels and descriptions', () => {
            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            expect(screen.getByRole('search', { name: 'Advanced pet filters' })).toBeInTheDocument();
            expect(screen.getByLabelText('Species')).toHaveAttribute('aria-describedby', 'species-help');
            expect(screen.getByLabelText('Min Age')).toHaveAttribute('aria-describedby', 'min-age-help');
            expect(screen.getByLabelText('Max Age')).toHaveAttribute('aria-describedby', 'max-age-help');
            expect(screen.getByRole('slider')).toHaveAttribute('aria-describedby', 'distance-help');
        });

        it('has proper group labeling for personality tags', () => {
            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            expect(screen.getByRole('group', { name: 'Personality preferences' })).toBeInTheDocument();
        });

        it('provides descriptive help text for each section', () => {
            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            expect(screen.getByText('Choose the type of pet you\'re looking for')).toBeInTheDocument();
            expect(screen.getByText('Age range in years (0-20)')).toBeInTheDocument();
            expect(screen.getByText('Pet size preference')).toBeInTheDocument();
            expect(screen.getByText('What are you looking for?')).toBeInTheDocument();
            expect(screen.getByText('Maximum distance from your location')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('handles undefined values gracefully', () => {
            const undefinedFilters: PetFilters = {};

            render(
                <AdvancedPetFilters
                    value={undefinedFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
            expect(screen.getByDisplayValue('50')).toBeInTheDocument(); // Default distance
        });

        it('handles large personality tag arrays', () => {
            const filtersWithManyTags: PetFilters = {
                ...defaultFilters,
                personalityTags: ['Friendly', 'Energetic', 'Calm', 'Playful', 'Affectionate', 'Independent', 'Social', 'Gentle'],
            };

            render(
                <AdvancedPetFilters
                    value={filtersWithManyTags}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            expect(screen.getByText('Select personality traits you prefer (8 selected)')).toBeInTheDocument();
        });
    });

    describe('Form Behavior', () => {
        it('prevents default form submission', async () => {
            const user = userEvent.setup();
            const mockSubmit = jest.fn((e) => e.preventDefault());

            render(
                <form onSubmit={mockSubmit}>
                    <AdvancedPetFilters
                        value={defaultFilters}
                        onChange={mockOnChange}
                        onReset={mockOnReset}
                        onApply={mockOnApply}
                    />
                </form>
            );

            const form = screen.getByRole('search');
            await user.type(form, '{Enter}');

            // Form should not submit by default
            expect(mockSubmit).not.toHaveBeenCalled();
        });
    });

    describe('Performance', () => {
        it('renders efficiently with many options', () => {
            const startTime = performance.now();

            render(
                <AdvancedPetFilters
                    value={defaultFilters}
                    onChange={mockOnChange}
                    onReset={mockOnReset}
                    onApply={mockOnApply}
                />
            );

            const endTime = performance.now();
            expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
        });
    });
});