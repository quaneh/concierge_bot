import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import axios from 'axios';
import { Send, Loader } from 'lucide-react';

const ChatbotContent = () => {
  const { tenantId } = useParams();
  const [roomNumber, setRoomNumber] = useState('');
  const [name, setName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const response = await axios.get(`/tenant/${tenantId}`);
        setTenantName(response.data.tenant_name);
      } catch (error) {
        console.error('Error fetching tenant info:', error);
        setTenantName('Hotel');  // Fallback name if fetch fails
      }
    };

    fetchTenantInfo();
  }, [tenantId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAuthentication = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setMessages([{ text: "Hello! What can I help you with today?", isUser: false }]);
  };

  const handleSendMessage = async () => {
    if (currentMessage.trim() === '') return;

    const newMessage = { text: currentMessage, isUser: true };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('/chat', {
        tenant_id: tenantId,
        guest_name: name,
        guest_message: currentMessage
      });

      setMessages(prevMessages => [
        ...prevMessages,
        { text: response.data.response, isUser: false }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = "Sorry, I'm having trouble connecting right now. Please try again later.";
      if (error.response) {
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response received from server. Please check your connection.";
      }
      setMessages(prevMessages => [
        ...prevMessages,
        { text: errorMessage, isUser: false }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f5f2eb]">
      {!isAuthenticated ? (
        <div className="flex-grow flex items-center justify-center p-8">
          <form onSubmit={handleAuthentication} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-center text-[#3a3a3a]">{tenantName} AI Concierge</h2>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="Room Number"
              className="w-full p-4 mb-6 border border-[#d6cec4] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#a99e91]"
              required
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full p-4 mb-6 border border-[#d6cec4] rounded-md text-base focus:outline-none focus:ring-2 focus:ring-[#a99e91]"
              required
            />
            <button
              type="submit"
              className="w-full bg-[#a99e91] text-white p-4 rounded-md text-base font-semibold hover:bg-[#8c8275] transition-colors"
            >
              Start Chat
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-auto p-8 flex flex-col-reverse">
            <div ref={messagesEndRef} />
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.isUser ? 'text-right' : 'text-left'
                }`}
              >
                <span
                  className={`inline-block p-4 rounded-lg max-w-[80%] break-words ${
                    message.isUser
                      ? 'bg-[#a99e91] text-white'
                      : 'bg-[#e6e0d8] text-[#3a3a3a]'
                  }`}
                >
                  {message.text}
                </span>
              </div>
            )).reverse()}
          </div>
          <div className="p-6 bg-white shadow-md">
            <div className="flex items-center">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow p-4 border border-[#d6cec4] rounded-l-md text-base focus:outline-none focus:ring-2 focus:ring-[#a99e91]"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#a99e91] text-white p-4 rounded-r-md hover:bg-[#8c8275] transition-colors flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? <Loader className="animate-spin" size={24} /> : <Send size={24} />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const HotelChatbot = () => {
  return (
    <Router>
      <Routes>
        <Route path="/:tenantId" element={<ChatbotContent />} />
      </Routes>
    </Router>
  );
};

export default HotelChatbot;