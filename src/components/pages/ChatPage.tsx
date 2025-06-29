import {useEffect, useState} from 'react';
import SendIcon from '../ui/SendIcon';
import {useJoin} from "@/lib/useCommon";
import {useCatStore} from "@/store/catStore";
import {RootState} from "@/store";
import {useDispatch, useSelector} from "react-redux";
import {clearCurrentMsg, clearHistoryMsg} from "@/store/slices/room";
import {glob} from "tinyglobby";

interface ChatPageProps {
  selectedCat: any;
  onBack: () => void;
  onVideoCall: () => void;
}

const ChatPage = ({ selectedCat, onBack, onVideoCall, isVideoCall, messages, setMessages }: ChatPageProps) => {
  const [message, setMessage] = useState('');
  const dispatch = useDispatch();

  const [isComposing, setIsComposing] = useState(false);
  const { selectCat,currentCat } = useCatStore();
  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // 模拟猫咪回复
    setTimeout(() => {
      const catReply = {
        id: Date.now() + 1,
        text: `${selectedCat?.name || '猫咪'}收到了你的消息喵~`,
        sender: 'cat' as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, catReply]);
    }, 1000);
  };

  const [joining, dispatchJoin] = useJoin();
  const toggleRecording = () => {
    onVideoCall();
    try {
      if (!currentCat) {
        return;
      }
      dispatchJoin(
          {
            roomId: "Room123",
            username: "testing-user",
            currentCat: currentCat,
            publishAudio: true,
          },
          false
      );
    } catch (err) {
      console.error('麦克风权限被拒绝或发生错误:', err);
    }
  };

  if (!selectedCat) return null;

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* 顶部标题栏 */}
      <div className="flex items-center px-6 py-4">
        <button
          onClick={onBack}
          className="mr-5 p-3 rounded-2xl hover:bg-white/15 text-white hover:text-white/90 transition-all duration-300 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-2xl overflow-hidden mr-4">
            <img
              src={selectedCat.avatar}
              alt={selectedCat.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xl">🐱</div>';
              }}
            />
          </div>
          <h2 className="text-white font-bold text-xl">{selectedCat.name}</h2>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center mb-6 shadow-xl">
              <span className="text-4xl">💬</span>
            </div>
            <p className="text-white font-semibold text-xl mb-3">开始和 {selectedCat.name} 聊天吧！</p>
            <p className="text-white/60 text-base">发送第一条消息开始对话</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'cat' && (
                <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-br from-white/20 to-white/10 flex-shrink-0 shadow-lg">
                  <img
                    src={selectedCat.avatar}
                    alt={selectedCat.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.parentElement!.innerHTML = '<span class="text-lg flex items-center justify-center h-full">🐱</span>';
                    }}
                  />
                </div>
              )}
              <div className={`message-bubble ${msg.sender === 'user' ? 'user' : 'cat'}`}>
                <p className="text-base leading-relaxed break-words font-medium">{msg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 底部输入区域 */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* 主输入区域 */}
          <div className="flex items-center gap-4">
            {/* 输入框容器 */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder="输入消息..."
                className="chat-input"
              />
            </div>

            {/* 发送按钮 */}
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="px-8 py-4 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-white rounded-lg transition-all duration-300 shadow-xl hover:shadow-blue-500/30 font-semibold text-base transform hover:scale-105 hover:-translate-y-0.5 active:scale-95"
            >
              <SendIcon className="w-9 h-9" />
            </button>

            {/* 视频电话按钮 */}
            <button
              onClick={toggleRecording}
              className="p-4 bg-gradient-to-br from-green-500/80 to-emerald-600/80 hover:from-green-500 hover:to-emerald-600 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/30 transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 backdrop-blur-sm"
            >
              <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;