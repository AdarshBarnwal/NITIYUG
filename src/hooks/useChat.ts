import { useState, useCallback, useEffect } from "react";
import { Conversation, Message, ChatState } from "@/types/chat";

const STORAGE_KEY = "chatbot-conversations";

// Mock responses for demonstration
const MOCK_RESPONSES = [
  "I understand your question. Let me help you with that.",
  "That's an interesting point. Here's what I think...",
  "Based on what you've shared, I'd suggest the following approach...",
  "Let me break this down for you step by step.",
  "I can definitely help you with that. Here are some options to consider...",
  "That's a great question! Let me provide you with a comprehensive answer.",
  "I see what you're looking for. Here's how you can approach this...",
  "Thank you for sharing that. Based on your input, here's my recommendation...",
];

const generateMockResponse = (): string => {
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
};

const generateConversationTitle = (firstMessage: string): string => {
  const words = firstMessage.trim().split(" ").slice(0, 6);
  return words.join(" ") + (firstMessage.length > 50 ? "..." : "");
};

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    currentConversationId: null,
    isLoading: false,
    error: null,
  });

  // Load conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const conversations = JSON.parse(stored).map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setState((prev) => ({ ...prev, conversations }));
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    }
  }, []);

  // Save conversations to localStorage
  const saveConversations = useCallback((conversations: Conversation[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, []);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setState((prev) => {
      const updated = [newConversation, ...prev.conversations];
      saveConversations(updated);
      return {
        ...prev,
        conversations: updated,
        currentConversationId: newConversation.id,
      };
    });

    return newConversation.id;
  }, [saveConversations]);

  const selectConversation = useCallback((conversationId: string) => {
    setState((prev) => ({
      ...prev,
      currentConversationId: conversationId,
    }));
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      let conversationId = state.currentConversationId;

      // Create new conversation if none exists
      if (!conversationId) {
        conversationId = createNewConversation();
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      // Add user message immediately
      setState((prev) => {
        const conversations = prev.conversations.map((conv) => {
          if (conv.id === conversationId) {
            const updatedConv = {
              ...conv,
              messages: [...conv.messages, userMessage],
              updatedAt: new Date(),
              title:
                conv.messages.length === 0
                  ? generateConversationTitle(content)
                  : conv.title,
            };
            return updatedConv;
          }
          return conv;
        });
        saveConversations(conversations);
        return {
          ...prev,
          conversations,
          isLoading: true,
          currentConversationId: conversationId,
        };
      });

      // Simulate API call delay and add assistant response
      setTimeout(
        () => {
          const assistantMessage: Message = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: generateMockResponse(),
            timestamp: new Date(),
          };

          setState((prev) => {
            const conversations = prev.conversations.map((conv) => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  messages: [...conv.messages, assistantMessage],
                  updatedAt: new Date(),
                };
              }
              return conv;
            });
            saveConversations(conversations);
            return {
              ...prev,
              conversations,
              isLoading: false,
            };
          });
        },
        1000 + Math.random() * 2000,
      ); // Random delay between 1-3 seconds
    },
    [state.currentConversationId, createNewConversation, saveConversations],
  );

  const deleteConversation = useCallback(
    (conversationId: string) => {
      setState((prev) => {
        const conversations = prev.conversations.filter(
          (conv) => conv.id !== conversationId,
        );
        saveConversations(conversations);
        return {
          ...prev,
          conversations,
          currentConversationId:
            prev.currentConversationId === conversationId
              ? conversations.length > 0
                ? conversations[0].id
                : null
              : prev.currentConversationId,
        };
      });
    },
    [saveConversations],
  );

  const currentConversation = state.conversations.find(
    (conv) => conv.id === state.currentConversationId,
  );

  return {
    conversations: state.conversations,
    currentConversation,
    isLoading: state.isLoading,
    error: state.error,
    createNewConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
  };
};
