import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

export const ChatInterface = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    conversations,
    currentConversation,
    isLoading,
    createNewConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
  } = useChat();

  const handleNewChat = () => {
    createNewConversation();
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversation?.id || null}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={deleteConversation}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onNewChat={handleNewChat}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <MessageList
          messages={currentConversation?.messages || []}
          isLoading={isLoading}
        />

        <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
