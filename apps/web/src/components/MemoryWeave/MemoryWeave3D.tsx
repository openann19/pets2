'use client';
import { ChatBubbleLeftRightIcon, ClockIcon, EyeIcon, HeartIcon, } from '@heroicons/react/24/outline';
import { BrainCircuitIcon } from '@heroicons/react/24/solid';
import { logger } from '@pawfectmatch/core';
;
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ConversationTimeline } from './ConversationTimeline';
import { MemoryWeave } from './MemoryWeave';
export function MemoryWeave3D({ matchId, userId, partnerId, messages, onClose, }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [activeView, setActiveView] = useState('overview');
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start'],
    });
    useEffect(() => {
        if (messages.length > 0 && !analysis) {
            analyzeConversation();
        }
    }, [messages, analysis]);
    const analyzeConversation = async () => {
        setIsAnalyzing(true);
        try {
            // Simulate AI analysis with realistic delay
            await new Promise((resolve) => setTimeout(resolve, 3000));
            const mockAnalysis = generateMockAnalysis();
            setAnalysis(mockAnalysis);
        }
        catch (error) {
            logger.error('Analysis failed:', { error });
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    const generateMockAnalysis = () => {
        const totalMessages = messages.length;
        const userMessages = messages.filter((m) => m.senderId === userId).length;
        const partnerMessages = messages.filter((m) => m.senderId === partnerId).length;
        // Analyze sentiment based on message content
        const positiveWords = [
            'great',
            'love',
            'awesome',
            'perfect',
            'wonderful',
            'excited',
            'happy',
            'amazing',
        ];
        const negativeWords = ['disappointed', 'worried', 'concerned', 'unhappy', 'sad', 'upset'];
        let positiveScore = 0;
        let negativeScore = 0;
        messages.forEach((msg) => {
            const content = msg.content.toLowerCase();
            positiveWords.forEach((word) => {
                if (content.includes(word))
                    positiveScore++;
            });
            negativeWords.forEach((word) => {
                if (content.includes(word))
                    negativeScore++;
            });
        });
        const sentimentScore = Math.max(0, Math.min(100, 50 + (positiveScore - negativeScore) * 8));
        const compatibilityScore = Math.floor(Math.random() * 30) + 70; // 70-100
        return {
            conversationId: `conv-${userId}-${partnerId}`,
            participants: [userId, partnerId],
            analysisDate: new Date().toISOString(),
            metrics: {
                totalMessages,
                messageDistribution: {
                    [userId]: userMessages,
                    [partnerId]: partnerMessages,
                },
                averageResponseTime: Math.random() * 60 + 15, // 15-75 minutes
                conversationLength: totalMessages > 50 ? 'long' : totalMessages > 20 ? 'medium' : 'short',
                sentimentScore,
                engagementLevel: userMessages > 10 ? 'high' : userMessages > 5 ? 'medium' : 'low',
            },
            insights: {
                communicationStyle: sentimentScore > 70 ? 'positive' : sentimentScore > 40 ? 'neutral' : 'cautious',
                sharedInterests: ['pets', 'outdoor activities', 'food', 'travel'].slice(0, Math.floor(Math.random() * 3) + 1),
                topicsDiscussed: ['pets', 'lifestyle', 'plans', 'experiences', 'hobbies'],
                emotionalTone: sentimentScore > 70 ? 'positive' : sentimentScore > 40 ? 'neutral' : 'mixed',
                relationshipStage: compatibilityScore > 80 ? 'established' : 'developing',
            },
            compatibility: {
                overallScore: compatibilityScore,
                factors: {
                    communication: Math.floor(compatibilityScore * 0.8 + Math.random() * 20),
                    interests: Math.floor(compatibilityScore * 0.7 + Math.random() * 30),
                    values: Math.floor(compatibilityScore * 0.9 + Math.random() * 10),
                    lifestyle: Math.floor(compatibilityScore * 0.75 + Math.random() * 25),
                },
            },
            recommendations: [
                {
                    id: 'schedule_meetup',
                    type: 'action',
                    title: 'Plan an In-Person Meetup',
                    description: 'Based on positive conversation flow, consider meeting in person',
                    priority: 'high',
                    actionable: true,
                },
                {
                    id: 'share_more_photos',
                    type: 'engagement',
                    title: 'Share More Pet Photos',
                    description: "Photos help build connection and show your pet's personality",
                    priority: 'medium',
                    actionable: true,
                },
                {
                    id: 'discuss_interests',
                    type: 'relationship',
                    title: 'Explore Shared Interests',
                    description: 'Ask about hobbies and activities to find common ground',
                    priority: 'medium',
                    actionable: true,
                },
            ],
            patterns: {
                responsePatterns: Math.random() > 0.5 ? 'responsive' : 'deliberate',
                topicFlow: totalMessages > 30 ? 'natural' : 'structured',
                emotionalPatterns: sentimentScore > 60 ? 'stable' : 'variable',
            },
        };
    };
    const getCompatibilityColor = (score) => {
        if (score >= 80)
            return 'text-green-600';
        if (score >= 65)
            return 'text-blue-600';
        if (score >= 50)
            return 'text-yellow-600';
        return 'text-red-600';
    };
    const getCompatibilityBg = (score) => {
        if (score >= 80)
            return 'bg-green-100';
        if (score >= 65)
            return 'bg-blue-100';
        if (score >= 50)
            return 'bg-yellow-100';
        return 'bg-red-100';
    };
    if (isAnalyzing) {
        return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 mx-auto mb-4">
            <BrainCircuitIcon className="w-full h-full text-purple-600"/>
          </motion.div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Memory Weave Analysis</h3>
          <p className="text-gray-600 mb-4">
            Analyzing conversation patterns and relationship dynamics...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div className="bg-purple-600 h-2 rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 3, ease: 'easeInOut' }}/>
          </div>
          <p className="text-sm text-gray-500 mt-2">Processing {messages.length} messages</p>
        </motion.div>
      </div>);
    }
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div ref={containerRef} initial={{ scale: 0.8, opacity: 0, rotateY: -15 }} animate={{ scale: 1, opacity: 1, rotateY: 0 }} exit={{ scale: 0.8, opacity: 0, rotateY: 15 }} transition={{ duration: 0.5, ease: 'easeOut' }} className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" style={{
            perspective: '1000px',
            transformStyle: 'preserve-3d',
        }}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="p-2 bg-purple-100 rounded-lg">
                <BrainCircuitIcon className="h-6 w-6 text-purple-600"/>
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Memory Weave</h2>
                <p className="text-gray-600">AI-powered conversation insights</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="text-gray-500 hover:text-gray-700">✕</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: EyeIcon },
            { id: 'analysis', label: 'Deep Analysis', icon: BrainCircuitIcon },
            { id: 'timeline', label: 'Timeline', icon: ClockIcon },
        ].map((tab) => (<button key={tab.id} onClick={() => setActiveView(tab.id)} className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeView === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
              <tab.icon className="h-5 w-5"/>
              {tab.label}
            </button>))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {activeView === 'overview' && (<motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-6">
                {/* Compatibility Score */}
                {analysis && (<div className="text-center p-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }} className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getCompatibilityBg(analysis.compatibility.overallScore)} mb-4`}>
                      <span className={`text-3xl font-bold ${getCompatibilityColor(analysis.compatibility.overallScore)}`}>
                        {analysis.compatibility.overallScore}
                      </span>
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Relationship Compatibility
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Based on {analysis.metrics.totalMessages} messages and conversation patterns
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">
                          {analysis.compatibility.factors.communication}%
                        </div>
                        <div className="text-sm text-gray-600">Communication</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">
                          {analysis.compatibility.factors.interests}%
                        </div>
                        <div className="text-sm text-gray-600">Interests</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">
                          {analysis.compatibility.factors.values}%
                        </div>
                        <div className="text-sm text-gray-600">Values</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-600">
                          {analysis.compatibility.factors.lifestyle}%
                        </div>
                        <div className="text-sm text-gray-600">Lifestyle</div>
                      </div>
                    </div>
                  </div>)}

                {/* Key Insights */}
                {analysis && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600"/>
                        <h4 className="font-semibold text-gray-900">Communication Style</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Style</span>
                          <span className="text-sm font-medium">
                            {analysis.insights.communicationStyle}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tone</span>
                          <span className="text-sm font-medium">
                            {analysis.insights.emotionalTone}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Stage</span>
                          <span className="text-sm font-medium">
                            {analysis.insights.relationshipStage}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <HeartIcon className="h-6 w-6 text-pink-600"/>
                        <h4 className="font-semibold text-gray-900">Shared Interests</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.insights.sharedInterests.map((interest, index) => (<span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                            {interest}
                          </span>))}
                      </div>
                    </div>
                  </div>)}

                {/* Quick Stats */}
                {analysis && (<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysis.metrics.totalMessages}
                      </div>
                      <div className="text-sm text-gray-600">Messages</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(analysis.metrics.averageResponseTime)}m
                      </div>
                      <div className="text-sm text-gray-600">Avg Response</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysis.metrics.sentimentScore}%
                      </div>
                      <div className="text-sm text-gray-600">Sentiment</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {analysis.metrics.engagementLevel}
                      </div>
                      <div className="text-sm text-gray-600">Engagement</div>
                    </div>
                  </div>)}
              </motion.div>)}

            {activeView === 'analysis' && analysis && (<motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <MemoryWeave userId={userId} conversationPartnerId={partnerId} conversationHistory={messages} onGenerateInsights={async () => analysis} onApplyRecommendation={(id) => {
                logger.info('Applied recommendation:', { id });
            }}/>
              </motion.div>)}

            {activeView === 'timeline' && (<motion.div key="timeline" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <ConversationTimeline conversationId={matchId} messages={messages} userId={userId} partnerId={partnerId}/>
              </motion.div>)}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>);
}
//# sourceMappingURL=MemoryWeave3D.jsx.map