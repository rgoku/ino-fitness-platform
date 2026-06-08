'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Send,
  Dumbbell,
  UtensilsCrossed,
  CalendarCheck,
  FileText,
  ThumbsUp,
  Heart,
  Flame,
  Check,
  CheckCheck,
  MoreHorizontal,
  Smile,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// --- Mock Data ---

interface Client {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  sender: 'coach' | 'client';
  content: string;
  timestamp: string;
  read: boolean;
  reactions?: string[];
}

const mockClients: Client[] = [
  {
    id: 'c1',
    name: 'James Wilson',
    lastMessage: 'Just finished my leg day! Feeling great',
    lastMessageTime: '2 min ago',
    unread: 3,
    online: true,
  },
  {
    id: 'c2',
    name: 'Maria Santos',
    lastMessage: 'Can we adjust my meal plan for next week?',
    lastMessageTime: '15 min ago',
    unread: 1,
    online: true,
  },
  {
    id: 'c3',
    name: 'Alex Chen',
    lastMessage: 'Thanks coach! I will start Monday.',
    lastMessageTime: '1h ago',
    unread: 0,
    online: false,
  },
  {
    id: 'c4',
    name: 'Sophie Laurent',
    lastMessage: 'My knee is feeling much better now',
    lastMessageTime: '3h ago',
    unread: 0,
    online: true,
  },
  {
    id: 'c5',
    name: 'David Park',
    lastMessage: 'Missed two workouts due to travel',
    lastMessageTime: '5h ago',
    unread: 2,
    online: false,
  },
  {
    id: 'c6',
    name: 'Emma Richards',
    lastMessage: 'Check-in photo sent!',
    lastMessageTime: '1d ago',
    unread: 0,
    online: false,
  },
];

const mockMessages: Record<string, Message[]> = {
  c1: [
    { id: 'm1', sender: 'client', content: 'Hey coach! Quick question about my program', timestamp: '10:15 AM', read: true, reactions: [] },
    { id: 'm2', sender: 'coach', content: 'Of course, what\'s up James?', timestamp: '10:16 AM', read: true, reactions: [] },
    { id: 'm3', sender: 'client', content: 'Should I increase weight on squats this week? I hit all my reps last time pretty easily', timestamp: '10:18 AM', read: true, reactions: [] },
    { id: 'm4', sender: 'coach', content: 'Great progress! Yes, bump it up by 5kg. If form stays solid, we keep progressing. Drop me a video of your top set.', timestamp: '10:20 AM', read: true, reactions: ['thumbsup'] },
    { id: 'm5', sender: 'client', content: 'Perfect, will do! Also my sleep has been rough this week, only getting about 5-6 hours', timestamp: '10:22 AM', read: true, reactions: [] },
    { id: 'm6', sender: 'coach', content: 'That\'s concerning. Let\'s keep intensity moderate until sleep improves. Try limiting screen time after 9pm and keep the room cool.', timestamp: '10:25 AM', read: true, reactions: ['heart'] },
    { id: 'm7', sender: 'client', content: 'Just finished my leg day! Feeling great', timestamp: '11:42 AM', read: false, reactions: [] },
  ],
  c2: [
    { id: 'm1', sender: 'client', content: 'Hi! I have a work dinner on Thursday and a birthday brunch on Saturday', timestamp: '9:30 AM', read: true, reactions: [] },
    { id: 'm2', sender: 'coach', content: 'No worries, we can plan around those. Do you know the restaurants?', timestamp: '9:35 AM', read: true, reactions: [] },
    { id: 'm3', sender: 'client', content: 'Can we adjust my meal plan for next week?', timestamp: '9:45 AM', read: false, reactions: [] },
  ],
  c5: [
    { id: 'm1', sender: 'client', content: 'Coach, I\'m traveling for work this week. Won\'t have gym access', timestamp: '8:00 AM', read: true, reactions: [] },
    { id: 'm2', sender: 'coach', content: 'No problem! I\'ll send you a bodyweight hotel room workout. How many days are you away?', timestamp: '8:15 AM', read: true, reactions: [] },
    { id: 'm3', sender: 'client', content: 'Missed two workouts due to travel', timestamp: '2:00 PM', read: false, reactions: [] },
    { id: 'm4', sender: 'client', content: 'Feeling a bit guilty about it honestly', timestamp: '2:01 PM', read: false, reactions: [] },
  ],
};

// Suggested responses based on context
function getSuggestedResponses(clientId: string, lastMessage: string): string[] {
  if (lastMessage.toLowerCase().includes('leg day') || lastMessage.toLowerCase().includes('finished')) {
    return [
      'Great work! How did the weights feel today?',
      'Awesome session! Don\'t forget to stretch and hydrate.',
      'Nice one! Rest up tonight, you earned it.',
    ];
  }
  if (lastMessage.toLowerCase().includes('meal plan') || lastMessage.toLowerCase().includes('adjust')) {
    return [
      'Sure thing! What changes are you looking for?',
      'Absolutely. Are there specific foods you want to swap?',
      'Let me review your current plan and send options.',
    ];
  }
  if (lastMessage.toLowerCase().includes('missed') || lastMessage.toLowerCase().includes('guilty')) {
    return [
      'No stress! Life happens. Did you get any movement in?',
      'That\'s okay, consistency over perfection. Let\'s refocus this week.',
      'Don\'t be too hard on yourself. How was nutrition while traveling?',
    ];
  }
  return [
    'Got it! Let me know if you need anything else.',
    'Sounds good, keep up the great work!',
    'Thanks for the update!',
  ];
}

// Quick action options after each interaction
const quickActions = [
  { id: 'workout', label: 'Send workout', icon: Dumbbell },
  { id: 'meal', label: 'Send meal plan', icon: UtensilsCrossed },
  { id: 'checkin', label: 'Schedule check-in', icon: CalendarCheck },
  { id: 'form', label: 'Send form', icon: FileText },
];

const reactionIcons = {
  thumbsup: ThumbsUp,
  heart: Heart,
  fire: Flame,
};

export default function MessagesPage() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>('c1');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredClients = mockClients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = selectedClientId ? messages[selectedClientId] || [] : [];
  const selectedClient = mockClients.find((c) => c.id === selectedClientId);
  const lastClientMessage = currentMessages.filter((m) => m.sender === 'client').pop();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  const handleSend = (content: string) => {
    if (!content.trim() || !selectedClientId) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      sender: 'coach',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      reactions: [],
    };

    setMessages((prev) => ({
      ...prev,
      [selectedClientId]: [...(prev[selectedClientId] || []), newMessage],
    }));
    setInputValue('');
    setShowSuggestions(false);

    // Simulate typing indicator then response
    setTypingIndicator(true);
    setTimeout(() => {
      setTypingIndicator(false);
      setShowSuggestions(true);
      setShowQuickActions(true);
    }, 2000);
  };

  const handleSuggestedResponse = (response: string) => {
    handleSend(response);
  };

  const handleReaction = (messageId: string, reaction: string) => {
    if (!selectedClientId) return;
    setMessages((prev) => ({
      ...prev,
      [selectedClientId]: prev[selectedClientId].map((m) =>
        m.id === messageId
          ? { ...m, reactions: m.reactions?.includes(reaction) ? m.reactions.filter((r) => r !== reaction) : [...(m.reactions || []), reaction] }
          : m
      ),
    }));
    setShowReactionPicker(null);
  };

  const handleQuickAction = (actionId: string) => {
    const actionMessages: Record<string, string> = {
      workout: 'I\'ve prepared a new workout for you. Check your program tab!',
      meal: 'Updated meal plan sent! Let me know if you have any questions.',
      checkin: 'I\'ve scheduled your next check-in. You\'ll get a reminder.',
      form: 'Sent you a quick form to fill out. Should take 2 minutes.',
    };
    handleSend(actionMessages[actionId] || '');
  };

  return (
    <div className="space-y-5 animate-slide-up">
      <h1 className="text-heading-1 text-[var(--color-text-primary)]">Messages</h1>

      <Card className="flex h-[calc(100vh-200px)] min-h-[560px] overflow-hidden">
        {/* Left Sidebar - Client List */}
        <div className="w-80 shrink-0 border-r border-[var(--color-border)] flex flex-col">
          <div className="p-3 border-b border-[var(--color-border)]">
            <Input
              placeholder="Search conversations..."
              icon={<Search size={14} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  setSelectedClientId(client.id);
                  setShowSuggestions(true);
                  setShowQuickActions(true);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100 border-b border-[var(--color-border-light)] ${
                  selectedClientId === client.id
                    ? 'bg-blue-50 dark:bg-blue-900/10'
                    : 'hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar name={client.name} size="md" />
                  {/* Online status dot */}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--color-surface)] ${
                      client.online ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-body-sm font-medium text-[var(--color-text-primary)] truncate">
                      {client.name}
                    </p>
                    <span className="text-body-xs text-[var(--color-text-tertiary)] shrink-0 ml-2">
                      {client.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-body-xs text-[var(--color-text-tertiary)] truncate mt-0.5">
                    {client.lastMessage}
                  </p>
                </div>

                {client.unread > 0 && (
                  <span className="shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-blue-600 text-white text-[10px] font-semibold tabular-nums">
                    {client.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="flex flex-1 flex-col">
          {selectedClient ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar name={selectedClient.name} size="md" />
                    {selectedClient.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--color-surface)] bg-emerald-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-body-sm font-medium text-[var(--color-text-primary)]">
                      {selectedClient.name}
                    </p>
                    <p className="text-body-xs text-[var(--color-text-tertiary)]">
                      {selectedClient.online ? 'Online' : 'Last seen ' + selectedClient.lastMessageTime}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" icon={<MoreHorizontal size={16} />} />
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {currentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'coach' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="group relative max-w-[70%]">
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          msg.sender === 'coach'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] rounded-bl-md'
                        }`}
                      >
                        <p className="text-body-sm">{msg.content}</p>
                      </div>

                      {/* Timestamp & read receipt */}
                      <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'coach' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">
                          {msg.timestamp}
                        </span>
                        {msg.sender === 'coach' && (
                          msg.read ? (
                            <CheckCheck size={12} className="text-blue-500" />
                          ) : (
                            <Check size={12} className="text-[var(--color-text-tertiary)]" />
                          )
                        )}
                      </div>

                      {/* Reactions */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className={`flex gap-1 mt-1 ${msg.sender === 'coach' ? 'justify-end' : 'justify-start'}`}>
                          {msg.reactions.map((r) => {
                            const Icon = reactionIcons[r as keyof typeof reactionIcons];
                            return Icon ? (
                              <span
                                key={r}
                                className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-[var(--color-surface-secondary)] border border-[var(--color-border-light)]"
                              >
                                <Icon size={12} className="text-[var(--color-text-secondary)]" />
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                      {/* Reaction picker trigger */}
                      <button
                        onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)}
                        className="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-xs"
                      >
                        <Smile size={12} className="text-[var(--color-text-tertiary)]" />
                      </button>

                      {/* Reaction picker dropdown */}
                      {showReactionPicker === msg.id && (
                        <div className={`absolute top-0 ${msg.sender === 'coach' ? 'right-8' : 'left-8'} flex gap-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-2 py-1 shadow-md z-10`}>
                          {Object.entries(reactionIcons).map(([key, Icon]) => (
                            <button
                              key={key}
                              onClick={() => handleReaction(msg.id, key)}
                              className="h-7 w-7 rounded-full hover:bg-[var(--color-surface-hover)] flex items-center justify-center transition-colors"
                            >
                              <Icon size={14} className="text-[var(--color-text-secondary)]" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {typingIndicator && (
                  <div className="flex justify-start">
                    <div className="bg-[var(--color-surface-secondary)] rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-[var(--color-text-tertiary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-[var(--color-text-tertiary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-[var(--color-text-tertiary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* "What would you like to do next?" Section */}
              {showQuickActions && lastClientMessage && (
                <div className="px-5 py-3 border-t border-[var(--color-border-light)] bg-[var(--color-surface-secondary)]/50">
                  <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] mb-2">
                    What would you like to do next?
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-body-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:border-blue-300 hover:text-blue-600 transition-colors"
                      >
                        <action.icon size={13} />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Responses (Sims-style) */}
              {showSuggestions && lastClientMessage && !typingIndicator && (
                <div className="px-5 py-3 border-t border-[var(--color-border-light)]">
                  <p className="text-body-xs font-medium text-[var(--color-text-tertiary)] mb-2">
                    Suggested responses
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {getSuggestedResponses(selectedClientId!, lastClientMessage.content).map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedResponse(suggestion)}
                        className="text-left rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 px-3 py-2 text-body-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="border-t border-[var(--color-border)] px-5 py-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(inputValue);
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-body-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Send size={16} />}
                    onClick={() => handleSend(inputValue)}
                    disabled={!inputValue.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-secondary)]">
                  <Send size={20} className="text-[var(--color-text-tertiary)]" />
                </div>
                <p className="text-body-sm font-medium text-[var(--color-text-primary)]">
                  Select a conversation
                </p>
                <p className="mt-1 text-body-xs text-[var(--color-text-tertiary)]">
                  Pick a client on the left to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
