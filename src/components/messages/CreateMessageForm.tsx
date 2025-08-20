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
  messageText: z.string().min(1, 'Message cannot be empty').max(500, 'Message is too long'),
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
    if (!user) return;

    setIsLoading(true);
    try {
      await createMessage({
        messageText: values.messageText,
        accountId: user.id,
      });
      
      form.reset();
      onMessageCreated();
      
      toast({
        title: 'Success',
        description: 'Your message has been posted!',
      });
    } catch (error) {
      toast({
        title: 'Failed to post message',
        description: error instanceof Error ? error.message : 'An error occurred while posting',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
                      placeholder="Share your thoughts..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Posting...' : 'Post Message'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};