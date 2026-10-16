import React, { useState, useRef, useEffect } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  MessageSquare,
  Send,
  Paperclip,
  ShieldCheck,
  CheckCheck,
  Clock,
  Image as ImageIcon,
  X,
  User,
  Headphones,
  Info,
} from 'lucide-react';

export const CustomerCareChatView: React.FC = () => {
  const { currentUser, chatMessages, sendChatMessage } = useBanking();
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter messages for current user thread
  const userThreadMessages = chatMessages.filter(
    (m) => m.threadId === (currentUser?.uid || 'guest')
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userThreadMessages.length, isSending]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || isSending) return;

    const textToSend = inputText.trim();
    const imgToSend = attachedImage || undefined;

    setInputText('');
    setAttachedImage(null);
    setIsSending(true);

    try {
      await sendChatMessage(textToSend, imgToSend);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    'Request wire trace confirmation',
    'Inquire about APY rate update',
    'Verify daily Fedwire limit increase',
    'Report an unexpected charge',
  ];

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-wide text-white">JP Morgan Private Treasury Support</h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Specialist Online
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct encrypted channel • Priority Relationship Management Desk
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-Bit Financial Encryption</span>
        </div>
      </div>

      {/* Info notice bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Your conversations are logged securely in compliance with commercial banking guidelines.</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          Client Ref: {currentUser?.uid?.substring(0, 10).toUpperCase() || 'JPM-CLIENT'}
        </span>
      </div>

      {/* Message History Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
        {userThreadMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">Direct Customer Care Desk</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Connect directly with a dedicated JP Morgan Treasury Specialist for account inquiries, wire assistance, and commercial operations.
            </p>
          </div>
        ) : (
          userThreadMessages.map((msg) => {
            const isUser = msg.senderRole === 'customer';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shrink-0 mt-1">
                    <Headphones className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-lg rounded-xl p-3.5 shadow-xs ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-br-none border border-slate-800'
                      : 'bg-white text-slate-900 rounded-bl-none border border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span
                      className={`text-[11px] font-semibold ${
                        isUser ? 'text-amber-300' : 'text-slate-700'
                      }`}
                    >
                      {msg.senderName}
                    </span>
                    <span
                      className={`text-[10px] ${
                        isUser ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Text Content */}
                  {msg.text && (
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  )}

                  {/* Image Attachment */}
                  {msg.imageUrl && (
                    <div className="mt-2.5 rounded overflow-hidden border border-slate-200/40 bg-black/5">
                      <img
                        src={msg.imageUrl}
                        alt="Message Attachment"
                        className="max-h-60 w-auto rounded object-contain cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => {
                          const w = window.open('');
                          w?.document.write(`<img src="${msg.imageUrl}" style="max-width:100%; height:auto;" />`);
                        }}
                      />
                      <div className="px-2 py-1 text-[10px] text-slate-400 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>Attached Image</span>
                      </div>
                    </div>
                  )}

                  {/* Status Indicator */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px]">
                    {isUser ? (
                      msg.status === 'sending' ? (
                        <Clock className="w-3 h-3 text-slate-400" />
                      ) : (
                        <span className="flex items-center gap-0.5 text-amber-400/90 font-mono">
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>{msg.status}</span>
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">Official Response</span>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 mt-1">
                    {currentUser?.displayName?.[0] || <User className="w-4 h-4" />}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0">Common requests:</span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => setInputText(p)}
            className="px-2.5 py-1 rounded bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 whitespace-nowrap text-[11px] transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Image Preview Bar if attached */}
      {attachedImage && (
        <div className="p-3 bg-amber-50/60 border-t border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded border border-amber-300 overflow-hidden bg-white">
              <img src={attachedImage} alt="Attachment Preview" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-800">Image Attached</div>
              <div className="text-[10px] text-slate-500">Ready to transmit with your message</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="p-1 rounded-full hover:bg-amber-100 text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Compose & Send Input Area */}
      <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach image"
          className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder="Type your message to JP Morgan customer care..."
          className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:border-slate-900 focus:outline-none text-xs sm:text-sm resize-none min-h-[42px] max-h-32"
        />

        <button
          type="submit"
          disabled={(!inputText.trim() && !attachedImage) || isSending}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs h-[42px]"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
