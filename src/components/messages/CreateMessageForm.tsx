import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare } from 'lucide-react';

const messageSchema = z.object({
  messageText: z.string()
    .min(1, 'Message cannot be empty')
    .max(255, 'Message cannot be longer than 255 characters'), // Backend limit is 255
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface CreateMessageFormProps {
  onMessageCreated: () => void;
}

export const CreateMessageForm = ({ onMessageCreated }: CreateMessageFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      messageText: '',
    },
  });

  const onSubmit = async (values: MessageFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'Please log in to create a message.',
        variant: 'destructive',
      });
      return;
    }

    // Check if we have a valid accountId
    if (!user.accountId) {
      toast({
        title: 'User Error',
        description: 'Invalid user data. Please log in again.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating message with user:', user);
      console.log('Message text:', values.messageText);

      // Send the correct field name that backend expects
      await createMessage({
        messageText: values.messageText.trim(),
        postedBy: user.accountId, // Changed from accountId to postedBy
      });
      
      form.reset();
      onMessageCreated();
      
      toast({
        title: 'Success',
        description: 'Your message has been posted!',
      });
    } catch (error) {
      console.error('Message creation error:', error);
      
      let errorMessage = 'Failed to create message. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid message data')) {
          errorMessage = 'Please check your message and try again.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid message data. Make sure your message is not empty and not too long.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Please log in again to create messages.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      
      toast({
        title: 'Failed to post message',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Please log in to create messages.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Create New Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="messageText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What's on your mind?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts... (max 255 characters)"
                      className="min-h-[100px] resize-none"
                      maxLength={255}
                      {...field}
                    />
                  </FormControl>
                  <div className="text-sm text-muted-foreground">
                    {field.value.length}/255 characters
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading || !user.accountId} className="w-full">
              {isLoading ? 'Posting...' : 'Post Message'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};