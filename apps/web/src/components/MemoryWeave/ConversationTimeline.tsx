import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import React, { useState } from 'react';
// import {
//   Timeline,
//   TimelineItem,
//   TimelineConnector,
//   TimelineHeader,
//   TimelineTitle,
//   TimelineDescription,
//   TimelineContent
// } from '@/components/ui/timeline';
import { Calendar, CheckCircle, Heart, MessageCircle, TrendingUp, Zap, Clock } from 'lucide-react';
export const ConversationTimeline = ({ messages, milestones = [], }) => {
    const [selectedPhase, setSelectedPhase] = useState(null);
    // Generate relationship phases based on conversation
    const generatePhases = () => {
        if (messages.length === 0)
            return [];
        const sortedMessages = [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const phases = [];
        const lastMessage = sortedMessages[sortedMessages.length - 1];
        const firstMessage = sortedMessages[0];
        if (!lastMessage || !firstMessage)
            return [];
        const totalDuration = new Date(lastMessage.timestamp).getTime() -
            new Date(firstMessage.timestamp).getTime();
        // Introduction Phase (First 20% of conversation)
        const introEndIndex = Math.floor(sortedMessages.length * 0.2);
        const introEndMessage = sortedMessages[introEndIndex];
        if (!introEndMessage)
            return [];
        phases.push({
            id: 'introduction',
            name: 'Getting to Know Each Other',
            startDate: firstMessage.timestamp,
            endDate: introEndMessage.timestamp,
            duration: Math.floor(totalDuration * 0.2),
            messageCount: introEndIndex + 1,
            keyTopics: ['introductions', 'basic_info', 'initial_questions'],
            emotionalTone: 'curious',
            engagement: 'building',
            significance: 'Foundation building and initial rapport',
        });
        // Development Phase (20-60% of conversation)
        const devStartIndex = introEndIndex + 1;
        const devEndIndex = Math.floor(sortedMessages.length * 0.6);
        const devStartMessage = sortedMessages[devStartIndex];
        const devEndMessage = sortedMessages[devEndIndex];
        if (!devStartMessage || !devEndMessage)
            return phases;
        phases.push({
            id: 'development',
            name: 'Building Connection',
            startDate: devStartMessage.timestamp,
            endDate: devEndMessage.timestamp,
            duration: Math.floor(totalDuration * 0.4),
            messageCount: devEndIndex - devStartIndex + 1,
            keyTopics: ['shared_interests', 'experiences', 'plans'],
            emotionalTone: 'engaged',
            engagement: 'active',
            significance: 'Deepening understanding and finding common ground',
        });
        // Deepening Phase (60-90% of conversation)
        const deepStartIndex = devEndIndex + 1;
        const deepEndIndex = Math.floor(sortedMessages.length * 0.9);
        const deepStart = sortedMessages[deepStartIndex];
        const deepEnd = sortedMessages[deepEndIndex];
        if (!deepStart || !deepEnd)
            return phases;
        phases.push({
            id: 'deepening',
            name: 'Strengthening Bond',
            startDate: deepStart.timestamp,
            endDate: deepEnd.timestamp,
            duration: Math.floor(totalDuration * 0.3),
            messageCount: deepEndIndex - deepStartIndex + 1,
            keyTopics: ['values', 'future_plans', 'commitments'],
            emotionalTone: 'connected',
            engagement: 'high',
            significance: 'Moving toward meaningful relationship development',
        });
        // Current Phase (Last 10%)
        const currentStartIndex = deepEndIndex + 1;
        const currentStart = sortedMessages[currentStartIndex];
        phases.push({
            id: 'current',
            name: 'Current Phase',
            startDate: currentStart?.timestamp || lastMessage.timestamp,
            endDate: lastMessage.timestamp,
            duration: Math.floor(totalDuration * 0.1),
            messageCount: sortedMessages.length - currentStartIndex,
            keyTopics: ['ongoing_discussions', 'plans', 'next_steps'],
            emotionalTone: 'established',
            engagement: 'strong',
            significance: 'Active relationship maintenance and growth',
        });
        return phases;
    };
    const phases = generatePhases();
    const getPhaseColor = (phaseId) => {
        switch (phaseId) {
            case 'introduction':
                return 'bg-blue-500';
            case 'development':
                return 'bg-green-500';
            case 'deepening':
                return 'bg-purple-500';
            case 'current':
                return 'bg-orange-500';
            default:
                return 'bg-gray-500';
        }
    };
    const getEmotionalIcon = (tone) => {
        switch (tone) {
            case 'curious':
                return <MessageCircle className="h-4 w-4 text-blue-500"/>;
            case 'engaged':
                return <Heart className="h-4 w-4 text-green-500"/>;
            case 'connected':
                return <Heart className="h-4 w-4 text-purple-500"/>;
            case 'established':
                return <CheckCircle className="h-4 w-4 text-orange-500"/>;
            default:
                return <MessageCircle className="h-4 w-4 text-gray-500"/>;
        }
    };
    const formatDuration = (ms) => {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0)
            return `${days}d ${hours}h`;
        return `${hours}h`;
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    return (<div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-500"/>
            Conversation Timeline
          </CardTitle>
          <CardDescription>
            Track the evolution of your relationship through different phases
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Phase Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Relationship Phases</CardTitle>
          <CardDescription>
            How your conversation has progressed through different stages of connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases.map((phase) => (<div key={phase.id} className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedPhase === phase.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'}`} onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getPhaseColor(phase.id)}`}/>
                    <div>
                      <h4 className="font-semibold">{phase.name}</h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium">{phase.messageCount} messages</div>
                    <div className="text-xs text-gray-500">{formatDuration(phase.duration)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    {getEmotionalIcon(phase.emotionalTone)}
                    <span>{phase.emotionalTone}</span>
                  </div>
                  <Badge variant="outline">{phase.engagement} engagement</Badge>
                </div>

                {selectedPhase === phase.id && (<div className="mt-4 pt-4 border-t space-y-3">
                    <div>
                      <h5 className="font-medium mb-2">Key Topics:</h5>
                      <div className="flex flex-wrap gap-1">
                        {phase.keyTopics.map((topic, idx) => (<Badge key={idx} variant="secondary" className="text-xs">
                            {topic.replace('_', ' ')}
                          </Badge>))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Significance:</h5>
                      <p className="text-sm text-gray-700">{phase.significance}</p>
                    </div>
                  </div>)}
              </div>))}
          </div>
        </CardContent>
      </Card>

      {/* Key Milestones */}
      {milestones.length > 0 && (<Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500"/>
              Key Milestones
            </CardTitle>
            <CardDescription>Important moments that shaped your conversation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (<div key={milestone.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${milestone.type === 'positive'
                    ? 'bg-green-500'
                    : milestone.type === 'milestone'
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'}`}/>
                    {index < milestones.length - 1 && <div className="w-px h-8 bg-gray-300 mt-2"/>}
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{milestone.title}</h4>
                      <Badge variant={milestone.type === 'positive'
                    ? 'default'
                    : milestone.type === 'milestone'
                        ? 'secondary'
                        : 'outline'}>
                        {milestone.type}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{milestone.description}</p>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3"/>
                      {formatDate(milestone.timestamp)}
                    </div>
                  </div>
                </div>))}
            </div>
          </CardContent>
        </Card>)}

      {/* Relationship Health Indicator */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <TrendingUp className="h-8 w-8 text-blue-500 mx-auto"/>
            <div>
              <h3 className="text-lg font-semibold">Relationship Progress</h3>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                {phases.length > 0 && phases[phases.length - 1] ? phases[phases.length - 1].name : 'Starting Out'}
              </div>
              <p className="text-gray-600 mt-2">
                {messages.length} messages across {phases.length} relationship phases
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-xl font-semibold text-blue-600">
                  {phases.reduce((sum, phase) => sum + phase.messageCount, 0)}
                </div>
                <p className="text-xs text-gray-600">Total Messages</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-green-600">
                  {Math.round(messages.length / Math.max(1, phases.length))}
                </div>
                <p className="text-xs text-gray-600">Avg per Phase</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-purple-600">{phases.length}</div>
                <p className="text-xs text-gray-600">Phases</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-orange-600">{milestones.length}</div>
                <p className="text-xs text-gray-600">Milestones</p>
              </div>
            </div>

            <Progress value={((phases.findIndex((p) => p.id === 'current') + 1) / phases.length) * 100} className="mt-4"/>
            <p className="text-xs text-gray-500 mt-2">Relationship development progress</p>
          </div>
        </CardContent>
      </Card>
    </div>);
};
//# sourceMappingURL=ConversationTimeline.jsx.map
//# sourceMappingURL=ConversationTimeline.jsx.map