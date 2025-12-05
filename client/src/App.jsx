import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { Search, Mic, Home, Plus, Settings, Pen } from 'lucide-react'
import './index.css'

// Connect to the backend
const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001');

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Listen for incoming messages
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for initial history
    socket.on('load_messages', (history) => {
      setMessages(history);
    });

    return () => {
      socket.off('receive_message');
      socket.off('load_messages');
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const msgData = {
        text: message,
        sender: socket.id, // Identify myself temporarily
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Send to server
      socket.emit('send_message', msgData);

      // We also receive our own message via broadcast, but if we wanted optimistic UI:
      // setMessages((prev) => [...prev, { ...msgData, isMe: true }]);

      setMessage("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter messages to determine if they are mine or not
  // Since we broadcast to everyone including sender, we check socket.id
  // But socket.id changes on refresh. For a simple chat, this is fine.
  // Ideally, use a persistent user ID.

  return (
    <>
      {/* Top Right Header */}
      <div className="header">
        <a href="https://mail.google.com" className="header-link">Gmail</a>
        <a href="https://www.google.com/imghp" className="header-link">Images</a>
        <div className="header-icon-container">
          <svg className="header-icon" focusable="false" viewBox="0 0 24 24"><path d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z"></path></svg>
        </div>
        <div className="profile-icon">
          {/* Just a colored circle for profile */}
          <span>L</span>
        </div>
      </div>

      <div className="logo-container">
        <div className="logo-text" style={{ color: '#ffffff', letterSpacing: '-2px' }}>
          Google
        </div>
      </div>

      <div className="search-container">
        <form onSubmit={sendMessage} className="search-bar">
          <Search size={20} className="icon" style={{ marginLeft: '14px', color: '#5f6368' }} />
          <input
            type="text"
            className="search-input"
            placeholder="Search Google or type a URL"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ color: '#202124' }}
            autoFocus
          />
          <div className="search-right-icons">
            <Mic size={20} className="icon" style={{ color: '#5f6368' }} />
            {/* Lens icon proxy */}
            <svg className="icon" style={{ width: '24px', height: '24px', color: '#5f6368' }} viewBox="0 0 24 24"><path fill="currentColor" d="M17,12c0,-2.76 -2.24,-5 -5,-5s-5,2.24 -5,5 2.24,5 5,5 5,-2.24 5,-5zm-5,3c-1.65,0 -3,-1.35 -3,-3s1.35,-3 3,-3 3,1.35 3,3 -1.35,3 -3,3zm5,-9.05L17,5c0,-1.1 -0.9,-2 -2,-2L9,3c-1.1,0 -2,0.9 -2,2v0.95C6.97,5.95 4.96,6.96 4.96,6.96l0.01,0.01C3.18,8.8 2,11.23 2,13.91 2,18.33 5.67,22 10.09,22c4.34,0 7.91,-3.5 7.91,-7.83 0,-0.03 0,-0.07 0,-0.1 2.2,-0.2 3.96,-1.99 3.96,-4.21 0.04,-2.32 -1.82,-4.24 -4.96,-3.91zM10.09,20c-3.26,0 -5.91,-2.65 -5.91,-5.91 0,-3.26 2.65,-5.91 5.91,-5.91 3.26,0 5.91,2.65 5.91,5.91 0,3.26 -2.65,5.91 -5.91,5.91z"></path></svg>

            {/* AI Mode Button */}
            <div className="ai-mode-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}><path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z"></path></svg>
              AI Mode
            </div>
          </div>
        </form>
      </div>

      <div className="shortcuts">
        <div className="shortcut">
          <div className="shortcut-icon">
            {/* Web Store Icon Proxy */}
            <svg style={{ width: '24px', height: '24px', fill: '#e8eaed' }} viewBox="0 0 24 24"><path d="M12,2L12,2C6.48,2 2,6.48 2,12s4.48,10 10,10s10,-4.48 10,-10S17.52,2 12,2z M12,18c-3.31,0 -6,-2.69 -6,-6s2.69,-6 6,-6s6,2.69 6,6S15.31,18 12,18z"></path></svg>
          </div>
          <span className="shortcut-title">Web Store</span>
        </div>
        <div className="shortcut">
          <div className="shortcut-icon"><Plus size={24} color="#e8eaed" /></div>
          <span className="shortcut-title">Add shortcut</span>
        </div>
      </div>

      {/* Customize Chrome Button / Chat Toggle */}
      <div className="customize-btn" onClick={() => setShowChat(!showChat)}>
        <Pen size={14} fill="currentColor" />
        <span className="customize-text">Customize Chrome</span>
      </div>

      {/* Chat Area - Toggled visibility */}
      {showChat && (
        <div className="messages-container">
          <div className="messages-area">
            {messages.length === 0 && <div style={{ textAlign: 'center', color: '#9aa0a6', padding: 20 }}>No messages yet</div>}
            {messages.map((msg, index) => {
              const isMe = msg.sender === socket.id;
              return (
                <div key={index} className={`message-bubble ${isMe ? 'message-mine' : 'message-other'}`}>
                  <div>{msg.text}</div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}
    </>
  )
}

export default App
