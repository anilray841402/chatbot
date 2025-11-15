import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader, Trash2, Minimize2 } from "lucide-react";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hi! Welcome to MATECIA — India’s leading platform for building materials exhibitions. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8002/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await res.json();

      const botMessage = {
        role: "bot",
        content: data.answer || data.error || "Sorry, I couldn't process that.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        role: "bot",
        content: "Sorry, I'm having trouble connecting. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "bot",
        content: "Chat cleared! How can I help you?",
        timestamp: new Date(),
      },
    ]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isMinimized) {
    return (
      <div className="minimized-chat">
        <button
          onClick={() => setIsMinimized(false)}
          className="restore-button"
        >
          <Bot size={24} />
          <span>Chat Assistant</span>
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="chat-container">
        {/* Header */}
        <div className="chat-header">
          <div className="header-content">
            <div className="bot-avatar-header">
              <Bot size={24} />
            </div>
            <div className="header-info">
              <h3>MATECIA Assistant</h3>
              <span className="status">
                <span className="status-dot"></span>
                Online
              </span>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={clearChat} className="icon-button" title="Clear chat">
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="icon-button"
              title="Minimize"
            >
              <Minimize2 size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === "bot" ? (
                  <div className="bot-avatar">
                    <Bot size={20} />
                  </div>
                ) : (
                  <div className="user-avatar">
                    <User size={20} />
                  </div>
                )}
              </div>
              <div className="message-content">
                <div className="message-bubble">
                  <p>{msg.content}</p>
                </div>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message bot">
              <div className="message-avatar">
                <div className="bot-avatar">
                  <Bot size={20} />
                </div>
              </div>
              <div className="message-content">
                <div className="message-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-container">
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="send-button"
            >
              {loading ? <Loader className="spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .app-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .chat-container {
          width: 100%;
          max-width: 800px;
          height: 700px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bot-avatar-header {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .header-info h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          opacity: 0.9;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .icon-button {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .icon-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: #f8f9fa;
        }

        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          flex-shrink: 0;
        }

        .bot-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .message-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 70%;
        }

        .message.user .message-content {
          align-items: flex-end;
        }

        .message-bubble {
          padding: 12px 16px;
          border-radius: 16px;
          word-wrap: break-word;
          line-height: 1.5;
        }

        .message.bot .message-bubble {
          background: white;
          color: #1e293b;
          border-bottom-left-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .message.user .message-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-bubble p {
          margin: 0;
          font-size: 15px;
        }

        .message-time {
          font-size: 11px;
          color: #64748b;
          padding: 0 4px;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 16px;
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #667eea;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .chat-input-container {
          padding: 20px 24px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }

        .input-wrapper {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }

        .input-wrapper textarea {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          font-family: inherit;
          resize: none;
          outline: none;
          transition: all 0.2s;
          max-height: 120px;
        }

        .input-wrapper textarea:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-wrapper textarea:disabled {
          background: #f1f5f9;
          cursor: not-allowed;
        }

        .send-button {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .minimized-chat {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
        }

        .restore-button {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
          transition: all 0.3s;
        }

        .restore-button:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
        }

        @media (max-width: 768px) {
          .app-container {
            padding: 0;
          }

          .chat-container {
            height: 100vh;
            max-width: 100%;
            border-radius: 0;
          }

          .message-content {
            max-width: 85%;
          }
        }
      `}</style>
    </div>
  );
}

export default App;