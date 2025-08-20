import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Message, updateMessage, deleteMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Edit2, Trash2, Save, X, User } from 'lucide-react';

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

  const canEdit = user?.id === message.accountId;

  const handleEdit = async () => {
    if (!editText.trim()) {
      toast({
        title: 'Error',
        description: 'Message cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateMessage(message.id, { messageText: editText });
      setIsEditing(false);
      onMessageUpdated();
      toast({
        title: 'Success',
        description: 'Message updated successfully!',
      });
    } catch (error) {
      toast({
        title: 'Failed to update message',
        description: error instanceof Error ? error.message : 'An error occurred',
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
      await deleteMessage(message.id);
      onMessageUpdated();
      toast({
        title: 'Success',
        description: 'Message deleted successfully!',
      });
    } catch (error) {
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {message.postedBy || `User ${message.accountId}`}
            </span>
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
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isLoading}
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
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
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
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
        ) : (
          <p className="text-sm leading-relaxed">{message.messageText}</p>
        )}
      </CardContent>
    </Card>
  );
};