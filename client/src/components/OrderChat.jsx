import React, { useRef, useEffect, useState } from 'react';
import { useOrderChat } from '../hooks/useOrderChat';
import { Send, AlertTriangle } from 'lucide-react';


const QUICK_REPLIES = [
  "Coming down", 
  "Leave at door", 
  "Ring bell", 
  "Side gate", 
  "5 min away", 
  "Use back entrance"
];

export const OrderChat = ({ orderId, partnerName, partnerInitials, currentUserRole = 'customer' }) => {
  const [inputText, setInputText] = useState('');
  const { messages, send, isConnected, piiWarning } = useOrderChat(orderId);
  const scrollRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      send(inputText);
      setInputText('');
    }
  };

  const handleQuickReply = (text) => {
    send(text);
  };

  return (
    <div className="flex flex-col h-[550px] md:h-[600px] w-full bg-white rounded-3xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {partnerInitials}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{partnerName}</h3>
            <p className="text-xs text-gray-500">Order #{orderId.slice(0, 8)} · Chat expires on delivery</p>
          </div>
        </div>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      {/* Safety Banner */}
      <div className="bg-amber-50 p-2 px-4 flex items-start gap-2 border-b border-amber-100">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
        <p className="text-xs text-amber-800">
          This chat is monitored. Do not share personal contact info.
        </p>
      </div>

      {/* Messages List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.senderRole === currentUserRole ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              msg.senderRole === currentUserRole 
                ? 'bg-[#E53935] text-white rounded-tr-none' 
                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
            }`}>
              <p className="text-sm">{msg.body}</p>
              <p className={`text-[10px] mt-1 ${msg.senderRole === currentUserRole ? 'text-red-100' : 'text-gray-400'}`}>
                {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Replies */}
      <div className="p-2 border-t bg-white overflow-x-auto no-scrollbar whitespace-nowrap space-x-2">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => handleQuickReply(reply)}
            className="inline-block px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        {!isConnected ? (
          <div className="text-center py-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
            Chat is now closed
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-[#E53935] transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="w-10 h-10 bg-[#E53935] hover:bg-[#C62828] disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors shadow-lg shadow-red-500/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* PII Warning */}
        {piiWarning && (
          <p className="text-[11px] text-red-500 mt-2 ml-4 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {piiWarning}
          </p>
        )}
      </div>
    </div>
  );
};
