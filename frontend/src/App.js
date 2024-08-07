import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Loader } from 'lucide-react';

const HotelChatbot = () => {
  const [roomNumber, setRoomNumber] = useState('');
  const [surname, setSurname] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
        guest_name: surname,
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
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
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
    <div className="flex flex-col h-screen bg-gray-100">
      {!isAuthenticated ? (
        <div className="flex-grow flex items-center justify-center p-4">
          <form onSubmit={handleAuthentication} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-center">Welcome to Hotel Chat</h2>
            <input
              type="text"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="Room Number"
              className="w-full p-3 mb-4 border rounded text-base"
              required
            />
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="Surname"
              className="w-full p-3 mb-4 border rounded text-base"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-3 rounded text-base font-semibold hover:bg-blue-600 transition-colors"
            >
              Start Chat
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-auto p-4 flex flex-col-reverse">
            <div ref={messagesEndRef} />
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  message.isUser ? 'text-right' : 'text-left'
                }`}
              >
                <span
                  className={`inline-block p-3 rounded-lg max-w-[80%] break-words ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-black'
                  }`}
                >
                  {message.text}
                </span>
              </div>
            )).reverse()}
          </div>
          <div className="p-4 bg-white">
            <div className="flex items-center">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow p-3 border rounded-l text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white p-3 rounded-r hover:bg-blue-600 transition-colors flex items-center justify-center"
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

export default HotelChatbot;