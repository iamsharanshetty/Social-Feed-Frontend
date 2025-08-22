import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Message, updateMessage, deleteMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Edit2, Trash2, Save, X, User, Clock } from 'lucide-react';

interface MessageCardProps {
  message: Message;
  onMessageUpdated: () => void;
}

export const MessageCard = ({ message, onMessageUpdated }: MessageCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.messageText);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if current user can edit this message
  // Compare with postedBy field from backend
  const canEdit = user?.accountId === message.postedBy;

  const handleEdit = async () => {
    if (!editText.trim()) {
      toast({
        title: 'Error',
        description: 'Message cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    if (editText.length > 255) {
      toast({
        title: 'Error',
        description: 'Message cannot be longer than 255 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Backend expects messageId, not id
      const rowsAffected = await updateMessage(message.messageId, { messageText: editText.trim() });
      
      if (rowsAffected > 0) {
        setIsEditing(false);
        onMessageUpdated();
        toast({
          title: 'Success',
          description: 'Message updated successfully!',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update message. It may have been deleted.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Update message error:', error);
      let errorMessage = 'An error occurred while updating the message';
      
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          errorMessage = 'Invalid message text or message not found';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Failed to update message',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    setIsLoading(true);
    try {
      // Backend expects messageId, not id
      const rowsAffected = await deleteMessage(message.messageId);
      
      // Backend returns 0 if message didn't exist, 1 if deleted
      if (rowsAffected > 0) {
        toast({
          title: 'Success',
          description: 'Message deleted successfully!',
        });
      } else {
        toast({
          title: 'Info',
          description: 'Message was already deleted.',
        });
      }
      
      // Refresh the feed regardless to update UI
      onMessageUpdated();
    } catch (error) {
      console.error('Delete message error:', error);
      toast({
        title: 'Failed to delete message',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditText(message.messageText);
    setIsEditing(false);
  };

  // Format timestamp for display
  const formatTimestamp = (epochTime: number) => {
    const date = new Date(epochTime);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              User {message.postedBy}
            </span>
            {message.timePostedEpoch && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(message.timePostedEpoch)}</span>
              </div>
            )}
          </div>
          {canEdit && (
            <div className="flex items-center gap-1">
              {!isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    disabled={isLoading}
                    title="Edit message"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isLoading}
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    disabled={isLoading || !editText.trim()}
                    title="Save changes"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    title="Cancel editing"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-h-[60px] resize-none"
              disabled={isLoading}
              maxLength={255}
              placeholder="Edit your message..."
            />
            <div className="text-xs text-muted-foreground text-right">
              {editText.length}/255 characters
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.messageText}
          </p>
        )}
      </CardContent>
    </Card>
  );
};