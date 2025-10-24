'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
export function StoryProgress({ stories, currentIndex, isPaused }) {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        if (isPaused)
            return;
        const currentStory = stories[currentIndex];
        if (!currentStory)
            return;
        const duration = currentStory.duration * 1000; // Convert to ms
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);
            if (newProgress >= 100) {
                clearInterval(interval);
            }
        }, 16); // ~60fps
        return () => clearInterval(interval);
    }, [currentIndex, stories, isPaused]);
    // Reset progress when story changes
    useEffect(() => {
        setProgress(0);
    }, [currentIndex]);
    return (<div className="flex gap-1">
            {stories.map((story, index) => (<div key={story._id} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-white rounded-full" initial={{ width: '0%' }} animate={{
                width: index < currentIndex
                    ? '100%' // Completed stories
                    : index === currentIndex
                        ? `${progress}%` // Current story
                        : '0%', // Future stories
            }} transition={{
                duration: index === currentIndex && !isPaused ? 0.016 : 0,
                ease: 'linear',
            }}/>
                </div>))}
        </div>);
}
//# sourceMappingURL=StoryProgress.jsx.map