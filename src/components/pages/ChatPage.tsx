import {useEffect, useState} from 'react';
import SendIcon from '../ui/SendIcon';
import {RootState} from "@/store";
import {useDispatch, useSelector} from "react-redux";
import {clearHistoryMsg, setHistoryMsg} from "@/store/slices/room";
import { CatConfig } from '@/types/cat';
import { ChatService } from '@/services/chatService';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'cat';
  timestamp: Date;
  isVoice?: boolean; // 标记是否为语音消息
}

interface ChatPageProps {
  selectedCat: CatConfig | null;
  onBack: () => void;
  onVideoCall?: () => void;
}

const ChatPage = ({ selectedCat, onBack, onVideoCall }: ChatPageProps) => {
  const [message, setMessage] = useState('');
  const [messagesHistory, setMessagesHistory] = useState<{[catId: string]: Message[]}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const chatService = ChatService.getInstance();
  // const { selectCat,currentCat } = useCatStore();
  const dispatch = useDispatch();
  
  // 获取语音对话历史
  const msgHistory = useSelector((state: RootState) => state.room.msgHistory);
  const BotName = 'RobotMan_';
  
  // 获取当前猫咪的消息历史
  const messages = selectedCat?.id ? messagesHistory[selectedCat.id] || [] : [];

  // 当切换猫咪时清理语音历史
  useEffect(() => {
    if (selectedCat?.id) {
      dispatch(clearHistoryMsg());
    }
  }, [selectedCat?.id, dispatch]);

  // 将语音消息转换为文字消息格式，合并相邻的消息片段
  const convertVoiceToTextMessages = (voiceHistory: { user: string; value: string; time: number; definite?: boolean; paragraph?: boolean; isInterrupted?: boolean }[]): Message[] => {
    if (!voiceHistory.length) return [];
    
    const mergedMessages: Message[] = [];
    let currentMessage: { id: number; text: string; sender: 'user' | 'cat'; timestamp: Date; isVoice: boolean } | null = null;
    
    voiceHistory.forEach(msg => {
      if (!msg.value || !msg.value.trim()) return;
      
      const isBot = msg.user === BotName;
      const sender = isBot ? 'cat' : 'user';
      
      // 如果是新的说话者或者消息已完成，创建新消息
      if (!currentMessage || 
          currentMessage.sender !== sender || 
          (isBot && msg.definite) || 
          (!isBot && msg.paragraph)) {
        
        if (currentMessage) {
          mergedMessages.push(currentMessage);
        }
        
        currentMessage = {
          id: msg.time,
          text: msg.value,
          sender,
          timestamp: new Date(msg.time),
          isVoice: true
        };
      } else {
        // 合并到当前消息
        if (!msg.isInterrupted) {
          currentMessage.text += msg.value;
          currentMessage.timestamp = new Date(msg.time);
        }
      }
    });
    
    // 添加最后一条消息
    if (currentMessage) {
      mergedMessages.push(currentMessage);
    }
    
    return mergedMessages;
  };

  // 监听语音消息变化并更新显示
  useEffect(() => {
    if (msgHistory.length > 0 && selectedCat?.id) {
      const voiceMessages = convertVoiceToTextMessages(msgHistory);
      // 合并语音消息和文字消息，按时间排序
      setMessagesHistory(prevHistory => {
        const currentMessages = prevHistory[selectedCat.id] || [];
        const textMessages = currentMessages.filter(msg => !msg.isVoice);
        const allMessages = [...textMessages, ...voiceMessages];
        const sortedMessages = allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        return {
          ...prevHistory,
          [selectedCat.id]: sortedMessages
        };
      });
    }
  }, [msgHistory, selectedCat?.id]);

  const sendMessage = async () => {
    if (!message.trim() || !selectedCat?.id || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now(),
      text: message,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    // 同时更新文字消息历史和语音消息历史（Redux store）
    setMessagesHistory(prev => ({
      ...prev,
      [selectedCat.id]: [...(prev[selectedCat.id] || []), userMessage]
    }));
    
    // 不要将文字消息添加到语音记忆中，避免覆盖语音历史
    // dispatch(setHistoryMsg({ 
    //   text: message, 
    //   user: 'user', 
    //   paragraph: true, 
    //   definite: true,
    //   time: Date.now()
    // }));
    
    const currentMessage = message;
    setMessage('');
    setIsLoading(true);
    
    try {
      // 使用完整的猫咪配置，包括个性化prompt
      const fullPrompt = selectedCat.prompt || `你是${selectedCat.name}，一只可爱的猫咪。请用温暖友好的语气回复用户的消息。`;
      
      // 调用AI服务获取回复
      const response = await chatService.sendMessage({
        message: currentMessage,
        catId: selectedCat.id,
        prompt: fullPrompt
      });
      
      const catReply: Message = {
        id: Date.now() + 1,
        text: response.reply,
        sender: 'cat' as const,
        timestamp: new Date()
      };
      
      // 更新文字消息历史
      setMessagesHistory(prev => ({
        ...prev,
        [selectedCat.id]: [...(prev[selectedCat.id] || []), catReply]
      }));
      
      // 不要将文字回复添加到语音记忆中，避免覆盖语音历史
      // dispatch(setHistoryMsg({ 
      //   text: response.reply, 
      //   user: BotName, 
      //   paragraph: true, 
      //   definite: true,
      //   time: Date.now() + 1
      // }));
      
    } catch (error) {
      console.error('发送消息失败:', error);
      // 使用错误回复
      const errorReply: Message = {
        id: Date.now() + 1,
        text: chatService.getErrorReply(selectedCat.id),
        sender: 'cat' as const,
        timestamp: new Date()
      };
      
      setMessagesHistory(prev => ({
        ...prev,
        [selectedCat.id]: [...(prev[selectedCat.id] || []), errorReply]
      }));
      
      // 不要将错误回复添加到语音记忆中，避免覆盖语音历史
      // dispatch(setHistoryMsg({ 
      //   text: errorReply.text, 
      //   user: BotName, 
      //   paragraph: true, 
      //   definite: true,
      //   time: Date.now() + 1
      // }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedCat) return null;

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* SVG滤镜定义 - 复制自HomePage */}
      <svg style={{display: 'none'}}>
        <filter
          id="glass-distortion"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.01"
            numOctaves="1"
            seed="5"
            result="turbulence"
          />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
            <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
          <feSpecularLighting
            in="softMap"
            surfaceScale="5"
            specularConstant="1"
            specularExponent="100"
            lightingColor="white"
            result="specLight"
          >
            <fePointLight x="-200" y="-200" z="300" />
          </feSpecularLighting>
          <feComposite
            in="specLight"
            operator="arithmetic"
            k1="0"
            k2="1"
            k3="1"
            k4="0"
            result="litImage"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale="150"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

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
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
          messages.map((msg: Message) => (
            <div key={msg.id} className={`flex items-end gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'cat' && (
                <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-br from-white/20 to-white/10 flex-shrink-0 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
                <div className="message-bubble-glass-effect"></div>
                <div className="message-bubble-glass-tint"></div>
                <div className="message-bubble-glass-shine"></div>
                <div className="message-bubble-content">
                  <p className="text-base leading-relaxed break-words font-medium">{msg.text}</p>
                </div>
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
              <div className="chat-input-wrapper">
                <div className="chat-input-glass-effect"></div>
                <div className="chat-input-glass-tint"></div>
                <div className="chat-input-glass-shine"></div>
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
            </div>

            {/* 发送按钮 */}
            <button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className="glass-button px-8 py-4 rounded-lg"
            >
              <div className="glass-button-glass-effect"></div>
              <div className="glass-button-glass-tint"></div>
              <div className="glass-button-glass-shine"></div>
              <div className="glass-button-content">
                {isLoading ? (
                  <div className="w-12 h-12 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  </div>
                ) : (
                  <SendIcon className="w-12 h-12" />
                )}
              </div>
            </button>

            {/* 视频电话按钮 */}
            <button
              onClick={() => {
                if (onVideoCall) {
                  onVideoCall();
                }
              }}
              className="glass-button p-4 rounded-lg"
            >
              <div className="glass-button-glass-effect"></div>
              <div className="glass-button-glass-tint"></div>
              <div className="glass-button-glass-shine"></div>
              <div className="glass-button-content">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;