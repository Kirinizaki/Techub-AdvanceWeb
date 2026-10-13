
import { useState } from "react";
import { MessageCircle, Headset, X, Send, Minus,} from "lucide-react";

function ChatSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! Welcome to Techub. How can we help you today?",
      sender: "support",
    },
  ]);

  const handleSend = (e) => {
    e.preventDefault();

    const text = message.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender: "user",
      },
    ]);

    setMessage("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat window */}
      {isOpen && (
        <div className="mb-4 flex h-112.5 w-85 max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">

          {/* Header */}
          <div className="flex items-center gap-3 bg-[#0b1025] p-4 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
              <Headset size={21} />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-bold">
                Techub Support
              </h3>
              <p className="text-xs text-gray-300">
                Customer Service
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded p-1 hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex flex-1 flex-col gap-3 overflow-y-auto bg-gray-50 p-4"
            aria-live="polite"
          >
            {messages.map((item) => (
              <div
                key={item.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  item.sender === "user"
                    ? "self-end rounded-br-sm bg-blue-600 text-white"
                    : "self-start rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                }`}
              >
                {item.text}
              </div>
            ))}
          </div>

          {/* Message input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              aria-label="Type your message"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={!message.trim()}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send size={17} />
            </button>
          </form>
        </div>
      )}

      {/* Floating chat button */}    
        <div className="flex justify-end">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? "Close chat support" : "Open chat support"}
                aria-expanded={isOpen}
                className="flex h-14.5 w-38 items-center justify-center gap-2 rounded-lg bg-[#A9C5FF] text-[#0B1025] shadow-lg transition hover:bg-[#94B6FF]"
            >
                <Headset size={21} strokeWidth={2} />

                <div className="flex flex-col items-start leading-tight">
                    <span className="text-[8px] font-semibold uppercase tracking-wide">
                        Need Help?
                    </span>
                    <span className="text-sm font-bold">
                        Chat Support
                    </span>
                </div>
            </button>
        </div>

    </div>
  );
}

export default ChatSupport;
