import React from 'react';
import FullChatPanel from '../components/chat/FullChatPanel';

const ChatPage: React.FC = () => {
  return (
    <div className="flex flex-1 overflow-hidden">
      <FullChatPanel />
    </div>
  );
};

export default ChatPage;
