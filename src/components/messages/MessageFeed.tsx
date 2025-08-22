import { useState, useEffect } from 'react';
import { Message, getAllMessages } from '@/lib/api';
import { MessageCard } from './MessageCard';
import { CreateMessageForm } from './CreateMessageForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const MessageFeed = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) {
      setIsRefreshing(true);
    }
    
    try {
      console.log('Fetching messages from backend...');
      const fetchedMessages = await getAllMessages();
      console.log('Fetched messages:', fetchedMessages);
      
      // Sort by timestamp (newest first) if timePostedEpoch is available
      const sortedMessages = fetchedMessages.sort((a, b) => {
        if (a.timePostedEpoch && b.timePostedEpoch) {
          return b.timePostedEpoch - a.timePostedEpoch;
        }
        // Fallback to messageId if no timestamp (higher ID = newer)
        return (b.messageId || 0) - (a.messageId || 0);
      });
      
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      let errorMessage = 'Failed to load messages';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Failed to load messages',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMessageUpdate = () => {
    console.log('Message updated, refreshing feed...');
    fetchMessages();
  };

  const handleRefresh = () => {
    fetchMessages(true);
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
      {/* Create Message Form - only show if user is logged in */}
      {user && <CreateMessageForm onMessageCreated={handleMessageUpdate} />}
      
      {/* Messages Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Messages</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-muted-foreground">
              {user 
                ? "Be the first to share your thoughts!" 
                : "Log in to start sharing your thoughts!"
              }
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageCard
              key={message.messageId} // Use messageId instead of id
              message={message}
              onMessageUpdated={handleMessageUpdate}
            />
          ))
        )}
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground mt-8 p-4 bg-muted rounded">
          <div>Total messages: {messages.length}</div>
          <div>User: {user ? `${user.username} (ID: ${user.accountId})` : 'Not logged in'}</div>
          <div>Backend URL: http://localhost:8080</div>
        </div>
      )}
    </div>
  );
};