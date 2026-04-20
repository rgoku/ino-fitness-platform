import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockMessages, type MockMessage } from '@/lib/mock-data';
import { api, USE_API } from '@/lib/api';

export interface Conversation {
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

function deriveConversations(messages: MockMessage[]): Conversation[] {
  const convMap = new Map<string, Conversation>();

  for (const msg of messages) {
    const existing = convMap.get(msg.client_id);
    const isNewer = !existing || new Date(msg.timestamp) > new Date(existing.lastMessageTime);

    if (!existing) {
      convMap.set(msg.client_id, {
        clientId: msg.client_id,
        clientName: msg.client_name,
        lastMessage: msg.content,
        lastMessageTime: msg.timestamp,
        unreadCount: !msg.read && msg.sender === 'client' ? 1 : 0,
      });
    } else {
      if (isNewer) {
        existing.lastMessage = msg.content;
        existing.lastMessageTime = msg.timestamp;
      }
      if (!msg.read && msg.sender === 'client') {
        existing.unreadCount++;
      }
    }
  }

  return Array.from(convMap.values()).sort(
    (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async (): Promise<Conversation[]> => {
      if (USE_API) {
        const messages = await api.get<MockMessage[]>('/api/v1/coaching/messages');
        return deriveConversations(messages);
      }
      await new Promise((r) => setTimeout(r, 200));
      return deriveConversations(mockMessages);
    },
  });
}

export function useMessages(clientId: string | null) {
  return useQuery({
    queryKey: ['messages', clientId],
    queryFn: async (): Promise<MockMessage[]> => {
      if (USE_API) {
        return api.get<MockMessage[]>(`/api/v1/coaching/messages?client_id=${clientId}`);
      }
      await new Promise((r) => setTimeout(r, 200));
      return mockMessages
        .filter((m) => m.client_id === clientId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    },
    enabled: !!clientId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, clientName, content }: { clientId: string; clientName: string; content: string }) => {
      if (USE_API) {
        return api.post<MockMessage>('/api/v1/coaching/messages', {
          client_id: clientId,
          content,
        });
      }
      await new Promise((r) => setTimeout(r, 300));
      const newMsg: MockMessage = {
        id: `m${Date.now()}`,
        client_id: clientId,
        client_name: clientName,
        sender: 'coach',
        content,
        timestamp: new Date().toISOString(),
        read: true,
      };
      mockMessages.push(newMsg);
      return newMsg;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['messages', vars.clientId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
