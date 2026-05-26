import React, { useState, useRef, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const AIChat = () => {
  const { store } = useGlobalReducer();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your GymMind AI Coach 🤖 How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const user = store.user || JSON.parse(sessionStorage.getItem("user"));
  const token = store.token || sessionStorage.getItem("token");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const context = user
        ? `User name: ${user.first_name}, Fitness goal: ${user.fitness_goal || "not set"}`
        : "";

      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessage, context }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.response },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Sorry, I couldn't process that. Please try again." },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Connection error. Please check your internet and try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!token) return null;

  return (
    <>
      <style>{`
        .ai-chat-btn {
          position: fixed; bottom: 24px; right: 24px; z-index: 999;
          width: 56px; height: 56px; border-radius: 50%;
          background: #00e5ff; color: #000; border: none;
          font-size: 24px; cursor: pointer;
          box-shadow: 0 4px 20px rgba(0,229,255,0.4);
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ai-chat-btn:hover { transform: scale(1.1); box-shadow: 0 6px 24px rgba(0,229,255,0.6); }

        .ai-chat-window {
          position: fixed; bottom: 92px; right: 24px; z-index: 999;
          width: 340px; height: 480px;
          background: #0d1318; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; display: flex; flex-direction: column;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          animation: chatSlideUp 0.3s ease;
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .ai-chat-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 18px; border-bottom: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px 16px 0 0;
          background: rgba(0,229,255,0.06);
        }
        .ai-chat-header-left { display: flex; align-items: center; gap: 10px; }
        .ai-chat-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(0,229,255,0.15); border: 1px solid rgba(0,229,255,0.3);
          display: flex; align-items: center; justify-content: center; font-size: 16px;
        }
        .ai-chat-name { font-size: 14px; font-weight: 600; color: #f0f4f8; }
        .ai-chat-status { font-size: 11px; color: #00ff88; }
        .ai-chat-close {
          background: transparent; border: none; color: #6b7c8f;
          font-size: 18px; cursor: pointer; padding: 0; line-height: 1;
        }
        .ai-chat-close:hover { color: #f0f4f8; }

        .ai-chat-messages {
          flex: 1; overflow-y: auto; padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
          scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .ai-chat-bubble {
          max-width: 85%; padding: 10px 14px;
          border-radius: 12px; font-size: 13px; line-height: 1.5;
          font-family: 'DM Sans', sans-serif;
        }
        .ai-chat-bubble.user {
          background: #00e5ff; color: #000; align-self: flex-end;
          border-radius: 12px 12px 2px 12px;
        }
        .ai-chat-bubble.assistant {
          background: rgba(255,255,255,0.06); color: #f0f4f8;
          border: 1px solid rgba(255,255,255,0.08);
          align-self: flex-start; border-radius: 12px 12px 12px 2px;
        }
        .ai-chat-bubble.loading {
          background: rgba(255,255,255,0.04); color: #6b7c8f;
          align-self: flex-start;
        }

        .ai-chat-input-wrap {
          display: flex; gap: 8px; padding: 12px 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .ai-chat-input {
          flex: 1; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
          padding: 8px 12px; font-size: 13px; color: #f0f4f8;
          font-family: 'DM Sans', sans-serif; outline: none; resize: none;
          transition: border-color 0.2s;
        }
        .ai-chat-input:focus { border-color: #00e5ff; }
        .ai-chat-input::placeholder { color: #6b7c8f; }
        .ai-chat-send {
          background: #00e5ff; color: #000; border: none;
          width: 36px; height: 36px; border-radius: 8px;
          cursor: pointer; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: opacity 0.2s;
        }
        .ai-chat-send:hover { opacity: 0.85; }
        .ai-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* TOGGLE BUTTON */}
      <button className="ai-chat-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "✕" : "🤖"}
      </button>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="ai-chat-header-left">
              <div className="ai-chat-avatar">🤖</div>
              <div>
                <div className="ai-chat-name">AI Coach</div>
                <div className="ai-chat-status">● Online</div>
              </div>
            </div>
            <button className="ai-chat-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-chat-bubble ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="ai-chat-bubble loading">Typing...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-chat-input-wrap">
            <textarea
              className="ai-chat-input"
              placeholder="Ask your AI Coach..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="ai-chat-send"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;
