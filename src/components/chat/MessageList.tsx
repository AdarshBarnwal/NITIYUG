import { useEffect, useRef } from "react";
import { Message } from "./Message";
import { Message as MessageType } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot } from "lucide-react";

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
}

const TypingIndicator = () => (
  <div className="flex gap-3 p-4">
    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
      <Bot className="h-4 w-4 text-white" />
    </div>
    <div className="flex-1 space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Assistant</span>
        <span className="text-xs text-muted-foreground">typing...</span>
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-2 w-2 rounded-full animate-pulse" />
        <Skeleton className="h-2 w-2 rounded-full animate-pulse [animation-delay:0.2s]" />
        <Skeleton className="h-2 w-2 rounded-full animate-pulse [animation-delay:0.4s]" />
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center space-y-4 max-w-md">
      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
        <Bot className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Start a conversation</h3>
        <p className="text-sm text-muted-foreground">
          Ask me anything and I'll be happy to help you. I can assist with
          questions, provide information, or just have a friendly chat.
        </p>
      </div>
    </div>
  </div>
);

export const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return <EmptyState />;
  }

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};
