'use client';

import { useState, useRef, useEffect } from 'react';
import { useCatStore } from '@/store/catStore';
import { useActionStore } from '@/store/actionStore';
import { v4 as uuidv4 } from 'uuid';
import { ChatService } from '@/services/chatService';
import { getCatConfigById } from '@/lib/catConfigs';
import {CatConfig} from "@/types/cat";
import assert from "assert";

import {useJoin, useLeave} from "@/lib/useCommon";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/store";
import {clearHistoryMsg, setHistoryMsg} from "@/store/slices/room";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

const ChatInterface = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  // 每个角色独立的聊天记录
  // const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
  // 是否正在语音转文字
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // 每个角色独立的聊天记录，用redux维护便于更新语音字幕
  const globalMsg = useSelector((state: RootState) => state.room.msgHistory);
  const dispatch = useDispatch();


  // dispatch(setHistoryMsg({ text: msg, user, paragraph, definite }));
  const setChatHistory = (msg, catId, paragraph, definite) => {
    dispatch(setHistoryMsg({text: msg, user: catId, paragraph, definite}));
  };
  const clearChatHistory = () => {
    dispatch(clearHistoryMsg());
  }

  // dispatch(setHistoryMsg({ text: msg, user, paragraph, definite }));

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentCat } = useCatStore();
  const { triggerAction } = useActionStore();
  const chatService = ChatService.getInstance();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [joining, dispatchJoin] = useJoin();
  const roomId = uuidv4();
  const username = 'testing-user';
  const leave = useLeave();  // 顶层调用 Hook



  // 获取当前角色的聊天记录
  // const currentMessages = currentCat ? (globalMsg[currentCat.getState().id] || []) : [];
  const currentMessages = globalMsg
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);
  
  // 当切换角色时，清空输入框和加载状态
  useEffect(() => {
    if (currentCat) {
      setMessage('');
      setIsLoading(false);
    }
  }, [currentCat?.getState().id]);

  const sendMessage = async () => {
    if (!message.trim() || !currentCat || isLoading) return;

    const userMessageContent = message;
    // const userMessage: ChatMessage = {
    //   id: Date.now().toString(),
    //   content: userMessageContent,
    //   isUser: true,
    //   timestamp: new Date(),
    // };

    const catId = currentCat.getState().id;
    
    // 添加用户消息到当前角色的聊天记录
    setChatHistory(message, catId, true, true);
    setMessage('');
    setIsLoading(true);

    // 添加加载中的消息
    // const loadingMessage: ChatMessage = {
    //   id: (Date.now() + 1).toString(),
    //   content: '思考中...',
    //   isUser: false,
    //   timestamp: new Date(),
    //   isLoading: true,
    // };
    setChatHistory('思考中...', 'RobotMan_', false, false);

    try {
      const catConfig = getCatConfigById(currentCat.getState().id);
      if (!catConfig || !catConfig.prompt) {
        throw new Error('Cat configuration not found');
      }

      // 根据猫咪情绪调整prompt
      const emotionLevel = currentCat.getEmotionLevel();
      const modifiedPrompt = chatService.getEmotionModifiedPrompt(catConfig.prompt, emotionLevel);

      // 发送到AI服务
      const response = await chatService.sendMessage({
        message: userMessageContent,
        catId: currentCat.getState().id,
        prompt: modifiedPrompt,
      });

      // 移除加载消息，添加AI回复
      setChatHistory(response.reply, 'RobotMan_', true, true)
      // setChatHistory(prev => {
      //   const currentCatMessages = prev[catId] || [];
      //   const newMessages = currentCatMessages.filter(msg => !msg.isLoading);
      //   const catMessage: ChatMessage = {
      //     id: response.timestamp,
      //     content: response.reply,
      //     isUser: false,
      //     timestamp: new Date(response.timestamp),
      //   };
      //   return {
      //     ...prev,
      //     [catId]: [...newMessages, catMessage]
      //   };
      // });

      // 如果是罗西，触发愤怒动作
      if (currentCat.getState().id === 'roasty') {
        const catConfig = getCatConfigById('roasty');
        const angryAction = catConfig?.availableActions.find(action => action.id === 'angry');
        
        if (angryAction) {
          // 延迟一秒后触发愤怒动作，让用户先看到回复
          setTimeout(() => {
            triggerAction(angryAction);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // 移除加载消息，添加错误回复
      setChatHistory(chatService.getErrorReply(catId), 'RobotMan_', true, true);
    // setChatHistory(prev => {
      //   const catId = currentCat.getState().id;
      //   const currentCatMessages = prev[catId] || [];
      //   const newMessages = currentCatMessages.filter(msg => !msg.isLoading);
      //   const errorMessage: ChatMessage = {
      //     id: (Date.now() + 2).toString(),
      //     content: chatService.getErrorReply(catId),
      //     isUser: false,
      //     timestamp: new Date(),
      //   };
      //   return {
      //     ...prev,
      //     [catId]: [...newMessages, errorMessage]
      //   };
      // });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  // 语音对话。录制时候文本框缩放到右下角，输入框删除，并且在聊天记录中自动加入字幕。
  const toggleRecording = () => {
    if (isTranscribing) {
      leave();
      setIsTranscribing(false);
    } else {
      try {
        dispatchJoin(
            {
              roomId,
              username,
              publishAudio: true,
            },
            false
        );
        setIsTranscribing(true);
      } catch (err) {
        console.error('麦克风权限被拒绝或发生错误:', err);
      }
    }
  };

  // 清空当前角色的聊天记录
  const clearCurrentChat = () => {
    if (!currentCat) return;
    
    const catId = currentCat.getState().id;

    clearChatHistory();

    // setChatHistory(prev => ({
    //   ...prev,
    //   [catId]: []
    // }));
  };

  return (
      <div
          className="fixed bottom-6 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out"
          style={{
            left: isTranscribing ? '75%' : '50%',
          }}
      >
        <div className={`transition-all duration-500 ${isExpanded ? 'w-96 h-80' : 'w-80 h-16'}`}>
        {/* 主聊天容器 */}

        <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/50 overflow-hidden">
          {/* 折叠状态的顶部栏 */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm">
                  {currentCat ? getCatConfigById(currentCat.getState().id)?.name.charAt(0) || '🐱' : '🐱'}
                </span>
              </div>
              <span className="text-white font-medium">
                {isExpanded ? `与${currentCat ? getCatConfigById(currentCat.getState().id)?.name || '猫咪' : '猫咪'}对话中` : `和${currentCat ? getCatConfigById(currentCat.getState().id)?.name || '猫咪' : '猫咪'}聊天`}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* 清空聊天按钮 - 只在展开且有消息时显示 */}
              {isExpanded && currentMessages.length > 0 && (
                <button
                  onClick={clearCurrentChat}
                  className="w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center text-red-300 hover:text-red-200 transition-colors"
                  title="清空聊天记录"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              
              {/* AI状态指示器 */}
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                isLoading ? 'bg-yellow-400' : currentCat ? 'bg-green-400' : 'bg-gray-400'
              }`}></div>
              
              {/* 展开/收起图标 */}
              <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 展开状态的聊天内容 */}
          {isExpanded && (
            <>
              {/* 消息列表 */}
              <div className="flex-1 px-4 pb-4 overflow-y-auto max-h-48">
                <div className="space-y-3">
                  {currentMessages.length === 0 ? (
                    <div className="text-center text-white/70 py-6">
                      <div className="text-3xl mb-2">💬</div>
                      <p>
                        {currentCat 
                          ? `开始和${getCatConfigById(currentCat.getState().id)?.name || '猫咪'}聊天吧！` 
                          : '请先选择一只猫咪开始聊天'}
                      </p>
                    </div>
                  ) : (
                    currentMessages.map((msg) => (
                      <div
                        key={msg.time}
                        className={`flex ${msg.user=='testing-user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`
                            max-w-xs px-4 py-2 rounded-2xl text-sm
                            ${msg.user=='testing-user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                              : msg.definite==false
                                ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-400/30 animate-pulse'
                                : 'bg-white/20 text-white border border-white/30'
                            }
                          `}
                        >
                          {msg.definite==false && (
                            <div className="flex items-center space-x-1">
                              <div className="flex space-x-1">
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="ml-2">{msg.value}</span>
                            </div>
                          )}
                          {msg.definite && msg.value}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* 输入区域 */}
              <div className="flex w-full p-4 border-t border-white/20">
                {/* 左侧输入框+发送按钮容器 */}
                <div
                    className={`
      flex items-center space-x-3
      transition-all duration-500 ease-in-out
      overflow-hidden
      ${isTranscribing ? 'w-0 opacity-0' : 'w-4/5 opacity-100'}
    `}
                >
                  {/* 文本输入 */}
                  <div className="flex-1 relative transition-opacity duration-500">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={currentCat ? "输入消息..." : "请先选择猫咪"}
                        disabled={!currentCat || isLoading || isTranscribing}
                        className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* 发送按钮 */}
                  <button
                      onClick={sendMessage}
                      disabled={!message.trim() || !currentCat || isLoading || isTranscribing}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
                  >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    )}
                  </button>
                </div>

                {/* 右侧录音按钮容器 */}
                <div className={` flex w-1/5 justify-end transition-all duration-500`}>

                  <button
                      onClick={toggleRecording}
                      disabled={isTranscribing && joining}
                      className={`
        w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
        ${isTranscribing ? 'bg-red-500 animate-pulse ml-0' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg ml-3'}
      `}
                      style={{
                        marginLeft: isTranscribing ? '10' : '0',  // 这里用 marginLeft 控制按钮位置
                        transition: 'margin-left 0.5s ease-in-out',
                      }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>

                </div>

                <div
                    className={`
                      flex items-center space-x-3
                      transition-all duration-500 ease-in-out
                      overflow-hidden
                      ${isTranscribing ? 'w-4/5 opacity-100' : 'w-0 opacity-0'}
                    `}
                    >
                  {joining ? (<div className="flex w-full text-gray-400 text-sm font-medium select-none justify-center whitespace-nowrap">
                    连接中
                  </div>) : (<div className="flex w-full text-gray-400 text-sm font-medium select-none justify-center whitespace-nowrap">
                    语音模式，正在聆听
                  </div>)}

              </div>
              </div>

            </>
          )}
        </div>

        {/* 玻璃反光效果 */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      </div>
    </div>
  );

};

export default ChatInterface;