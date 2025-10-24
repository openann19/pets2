'use client';

import PremiumButton from '@/components/UI/PremiumButton';
import { GlassCard } from '@/components/UI/glass-card';
import { toast } from '@/lib/toast';
import { apiClient } from '@pawfectmatch/core/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface ModerationSettings {
    provider: 'openai' | 'deepseek' | 'mock';
    apiKeys: {
        openai: string;
        deepseek: string;
    };
    textThresholds: {
        toxicity: number;
        hate_speech: number;
        sexual_content: number;
        violence: number;
        spam: number;
    };
    imageThresholds: {
        explicit: number;
        suggestive: number;
        violence: number;
        gore: number;
    };
    autoActions: {
        block: boolean;
        flag_for_review: boolean;
        notify_admins: boolean;
    };
    enabledCategories: {
        text: string[];
        image: string[];
    };
}

export default function AIModerationSettingsPage() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['admin', 'ai', 'moderation', 'settings'],
        queryFn: async () => {
            const res = await apiClient.get<ModerationSettings>('/admin/ai/moderation/settings');
            return res.data;
        },
    });

    const [settings, setSettings] = useState<ModerationSettings | null>(null);

    const { mutateAsync: updateSettings, isPending } = useMutation({
        mutationFn: async (newSettings: ModerationSettings) => {
            return await apiClient.put('/admin/ai/moderation/settings', newSettings);
        },
        onSuccess: () => {
            toast.success('AI moderation settings updated');
            queryClient.invalidateQueries({ queryKey: ['admin', 'ai', 'moderation', 'settings'] });
        },
        onError: () => {
            toast.error('Failed to update settings');
        },
    });

    if (isLoading) return <div className="p-6">Loading...</div>;

    const currentSettings = settings || data;
    if (!currentSettings) return <div className="p-6">No settings found</div>;

    const handleThresholdChange = (category: 'textThresholds' | 'imageThresholds', key: string, value: number) => {
        setSettings(prev => ({
            ...(prev || currentSettings),
            [category]: {
                ...(prev || currentSettings)[category],
                [key]: value,
            },
        }));
    };

    const handleAutoActionToggle = (key: keyof ModerationSettings['autoActions']) => {
        setSettings(prev => ({
            ...(prev || currentSettings),
            autoActions: {
                ...(prev || currentSettings).autoActions,
                [key]: !(prev || currentSettings).autoActions[key],
            },
        }));
    };

    const handleProviderChange = (provider: 'openai' | 'deepseek' | 'mock') => {
        setSettings(prev => ({
            ...(prev || currentSettings),
            provider,
        }));
    };

    const handleApiKeyChange = (provider: 'openai' | 'deepseek', value: string) => {
        setSettings(prev => ({
            ...(prev || currentSettings),
            apiKeys: {
                ...(prev || currentSettings).apiKeys,
                [provider]: value,
            },
        }));
    };

    const handleSave = async () => {
        if (settings) {
            await updateSettings(settings);
        }
    };

    const activeSettings = settings || currentSettings;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">AI Moderation Settings</h1>
                <PremiumButton onClick={handleSave} disabled={!settings || isPending}>
                    {isPending ? 'Saving...' : 'Save Changes'}
                </PremiumButton>
            </div>

            {/* AI Provider Configuration */}
            <GlassCard className="p-6">
                <h2 className="text-xl font-semibold mb-4">🤖 AI Provider Configuration</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Select AI Provider</label>
                        <select
                            value={activeSettings.provider}
                            onChange={(e) => handleProviderChange(e.target.value as 'openai' | 'deepseek' | 'mock')}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg"
                        >
                            <option value="mock">Mock (Testing)</option>
                            <option value="openai">OpenAI Moderation API</option>
                            <option value="deepseek">DeepSeek AI</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
                        <input
                            type="password"
                            placeholder="sk-..."
                            value={activeSettings.apiKeys.openai}
                            onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Required for OpenAI provider. Get your key at platform.openai.com
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">DeepSeek API Key</label>
                        <input
                            type="password"
                            placeholder="sk-..."
                            value={activeSettings.apiKeys.deepseek}
                            onChange={(e) => handleApiKeyChange('deepseek', e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Required for DeepSeek provider. Get your key at platform.deepseek.com
                        </p>
                    </div>

                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                            ⚠️ API keys are stored securely and never exposed to clients. Use &quot;Mock&quot; for testing without API costs.
                        </p>
                    </div>
                </div>
            </GlassCard>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Text Moderation Thresholds */}
                <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Text Content Thresholds</h2>
                    <div className="space-y-4">
                        {Object.entries(activeSettings.textThresholds).map(([key, value]) => (
                            <div key={key}>
                                <label className="block text-sm font-medium mb-2 capitalize">
                                    {key.replace('_', ' ')}: {((value as number) * 100).toFixed(0)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={value as number}
                                    onChange={(e) => handleThresholdChange('textThresholds', key, parseFloat(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Permissive</span>
                                    <span>Strict</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Image Moderation Thresholds */}
                <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Image Content Thresholds</h2>
                    <div className="space-y-4">
                        {Object.entries(activeSettings.imageThresholds).map(([key, value]) => (
                            <div key={key}>
                                <label className="block text-sm font-medium mb-2 capitalize">
                                    {key}: {((value as number) * 100).toFixed(0)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={value as number}
                                    onChange={(e) => handleThresholdChange('imageThresholds', key, parseFloat(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Permissive</span>
                                    <span>Strict</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Auto Actions */}
                <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Automatic Actions</h2>
                    <div className="space-y-4">
                        {Object.entries(activeSettings.autoActions).map(([key, value]) => (
                            <label key={key} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={value as boolean}
                                    onChange={() => handleAutoActionToggle(key as keyof ModerationSettings['autoActions'])}
                                    className="w-5 h-5"
                                />
                                <span className="capitalize">{key.replace('_', ' ')}</span>
                            </label>
                        ))}
                    </div>
                </GlassCard>

                {/* Info Card */}
                <GlassCard className="p-6 bg-blue-500/10">
                    <h2 className="text-xl font-semibold mb-4">ℹ️ How It Works</h2>
                    <ul className="space-y-2 text-sm">
                        <li>• Thresholds determine when content is flagged</li>
                        <li>• Lower values = more sensitive detection</li>
                        <li>• Higher values = more permissive</li>
                        <li>• Auto-actions execute when content exceeds thresholds</li>
                        <li>• All flagged content is logged for review</li>
                    </ul>
                </GlassCard>
            </div>
        </div>
    );
}
