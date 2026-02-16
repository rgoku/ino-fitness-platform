'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { useConversations, useMessages, useSendMessage } from '@/hooks/use-messages';
import { ConversationList } from '@/components/messages/conversation-list';
import { MessageThread } from '@/components/messages/message-thread';
import { MessageInput } from '@/components/messages/message-input';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function MessagesPage() {
  const { data: conversations, isLoading: convsLoading } = useConversations();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { data: messages, isLoading: msgsLoading } = useMessages(selectedClientId);
  const sendMessage = useSendMessage();

  const selectedConv = conversations?.find((c) => c.clientId === selectedClientId);

  const handleSend = (content: string) => {
    if (!selectedClientId || !selectedConv) return;
    sendMessage.mutate({
      clientId: selectedClientId,
      clientName: selectedConv.clientName,
      content,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Messages</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Communicate with your clients
        </p>
      </div>

      <Card className="flex h-[calc(100vh-220px)] min-h-[500px] overflow-hidden">
        {/* Conversation list */}
        <div className="w-80 shrink-0 border-r border-border overflow-y-auto">
          <div className="p-3 border-b border-border">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Conversations</h2>
          </div>
          {convsLoading ? (
            <div className="p-3 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-1.5 h-3 w-36" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations && conversations.length > 0 ? (
            <ConversationList
              conversations={conversations}
              selectedId={selectedClientId}
              onSelect={setSelectedClientId}
            />
          ) : (
            <div className="p-4">
              <p className="text-sm text-[var(--color-text-tertiary)]">No conversations yet</p>
            </div>
          )}
        </div>

        {/* Message thread */}
        <div className="flex flex-1 flex-col">
          {selectedClientId && selectedConv ? (
            <>
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Avatar name={selectedConv.clientName} size="sm" />
                <p className="font-medium text-[var(--color-text-primary)]">
                  {selectedConv.clientName}
                </p>
              </div>

              {msgsLoading ? (
                <div className="flex-1 p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-2/3 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <MessageThread messages={messages || []} />
              )}

              <MessageInput
                onSend={handleSend}
                disabled={sendMessage.isPending}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="Select a conversation"
                description="Choose a client from the list to start messaging."
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
