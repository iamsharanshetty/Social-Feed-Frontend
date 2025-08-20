import { useState, useEffect } from 'react';
import { Message, getAllMessages } from '@/lib/api';
import { MessageCard } from './MessageCard';
import { CreateMessageForm } from './CreateMessageForm';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquare } from 'lucide-react';

export const MessageFeed = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      const fetchedMessages = await getAllMessages();
      setMessages(fetchedMessages.reverse()); // Show newest first
    } catch (error) {
      toast({
        title: 'Failed to load messages',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMessageUpdate = () => {
    fetchMessages();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading messages...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <CreateMessageForm onMessageCreated={handleMessageUpdate} />
      
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-muted-foreground">Be the first to share your thoughts!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              onMessageUpdated={handleMessageUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
};