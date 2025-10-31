import type { Message } from '../../hooks/useChatData';

const isoTime = (offsetMinutes: number): string => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - offsetMinutes);
  return date.toISOString();
};

export interface DemoChatThread {
  matchId: string;
  messages: Message[];
}

export const demoChatThread: DemoChatThread = {
  matchId: 'match-1',
  messages: [
    {
      _id: 'msg-1',
      matchId: 'match-1',
      content: 'Hi there! Buddy and I are excited for Saturday ☀️',
      senderId: 'other',
      timestamp: isoTime(120),
      read: true,
      type: 'text',
    },
    {
      _id: 'msg-2',
      matchId: 'match-1',
      content: "Same here! I'll bring extra tennis balls.",
      senderId: 'current-user',
      timestamp: isoTime(118),
      read: true,
      type: 'text',
      status: 'sent',
    },
    {
      _id: 'msg-3',
      matchId: 'match-1',
      content: "Perfect. Buddy's vet says low-sugar treats are best—I'll pack a few.",
      senderId: 'other',
      timestamp: isoTime(95),
      read: true,
      type: 'text',
    },
    {
      _id: 'msg-4',
      matchId: 'match-1',
      content: 'Amazing! By the way, just uploaded Buddy’s vaccine record to the app.',
      senderId: 'current-user',
      timestamp: isoTime(80),
      read: true,
      type: 'text',
      status: 'sent',
    },
    {
      _id: 'msg-5',
      matchId: 'match-1',
      content: 'Thank you! See you at 10 AM by the south entrance gate.',
      senderId: 'other',
      timestamp: isoTime(70),
      read: false,
      type: 'text',
    },
  ],
};

export const demoQuickReplies = [
  'On my way! 🚗',
  "Let's reschedule",
  'Sharing more photos 🐾',
  'Need a quick call?',
];