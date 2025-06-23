'use client';

import { useCatStore } from '@/store/catStore';
import { useActionStore } from '@/store/actionStore';
import { useEffect, useRef, useState } from 'react';
import { CatAction } from '@/types/cat';

const CatScene = () => {
  const { currentCat } = useCatStore();
  const { actionTrigger, clearTrigger } = useActionStore();
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const [currentActionId, setCurrentActionId] = useState<string>('idle');
  const [actionVideo, setActionVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [actionQueue, setActionQueue] = useState<CatAction[]>([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState<1 | 2>(1);
  // 已移除 isTransitioning 状态，使用更平滑的CSS过渡

  // 获取当前猫咪配置
  const catConfig = currentCat ? 
    require('@/lib/catConfigs').getCatConfigById(currentCat.getState().id) : 
    null;

  // 获取当前视频路径 - 优先显示动作视频，否则显示默认视频
  const currentVideoPath = actionVideo || (catConfig ? 
    catConfig.availableActions.find(action => action.id === catConfig.defaultAction)?.videoPath : 
    null);

  // 获取猫咪对应的emoji
  const getEmojiForCat = (catId: string) => {
    const emojiMap: { [key: string]: string } = {
      'kongkong': '🤖',
      'roasty': '😈',
      'luna': '🌙', 
      'momo': '🍑',
      'shadow': '🌚'
    };
    return emojiMap[catId] || '🐱';
  };

  // 根据猫咪获取场景背景
  const getSceneBackground = (catId: string) => {
    const backgrounds = {
      'kongkong': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 100%)', // 科技蓝色
      'roasty': 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)', // 舞台紫绿
    };
    return backgrounds[catId as keyof typeof backgrounds] || 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)';
  };

  // 渲染环境光照效果
  const renderEnvironmentLighting = (catId: string) => {
    if (catId === 'kongkong') {
      return (
        <>
          {/* 科技冷光 */}
          <div className="absolute top-20 left-20 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-40 right-32 w-80 h-80 bg-cyan-300/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-32 left-1/3 w-96 h-96 bg-indigo-400/6 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </>
      );
    } else if (catId === 'roasty') {
      return (
        <>
          {/* 舞台聚光灯效果 */}
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-yellow-200/15 via-orange-200/10 to-transparent rounded-full blur-2xl" />
          <div className="absolute top-32 left-20 w-40 h-40 bg-purple-400/12 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-32 right-20 w-40 h-40 bg-pink-400/12 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          {/* 舞台边缘彩光 */}
          <div className="absolute bottom-20 left-10 w-32 h-32 bg-red-400/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '3s' }} />
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-400/15 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        </>
      );
    }
    return null;
  };

  // 获取视频背景效果
  const getVideoBackgroundEffect = (catId: string) => {
    const effects = {
      'kongkong': 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
      'roasty': 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.05) 50%, transparent 70%)',
    };
    return effects[catId as keyof typeof effects] || 'transparent';
  };

  // 获取动作对应的emoji
  const getActionEmoji = (actionId: string) => {
    const actionEmojis: { [key: string]: string } = {
      'idle': '😴',
      'think': '🤔',
      'analyze': '🔍',
      'comfort': '🤗',
      'joke': '😏',
      'roast': '🔥',
      'mock': '😈',
      'perform': '🎭',
      'angry': '😡',
    };
    return actionEmojis[actionId] || '⭐';
  };

  // 处理动作点击 - 添加到队列
  const handleActionClick = (action: CatAction) => {
    if (isPlaying) {
      // 如果正在播放，添加到队列
      setActionQueue(prev => [...prev, action]);
    } else {
      // 如果没有播放，立即执行
      playAction(action);
    }
  };

  // 播放动作 - 使用平滑双缓冲技术
  const playAction = async (action: CatAction) => {
    setIsPlaying(true);
    setCurrentActionId(action.id);
    
    // 准备下一个视频
    const nextVideoIndex = activeVideoIndex === 1 ? 2 : 1;
    const nextVideoRef = nextVideoIndex === 1 ? videoRef1 : videoRef2;
    
    if (nextVideoRef.current) {
      // 在后台加载新视频
      nextVideoRef.current.src = action.videoPath;
      nextVideoRef.current.loop = false;
      nextVideoRef.current.load();
      
      // 等待视频加载并预播放
      await new Promise((resolve) => {
        const handleCanPlay = async () => {
          nextVideoRef.current?.removeEventListener('canplay', handleCanPlay);
          
          // 预播放视频但保持静音和暂停状态
          try {
            await nextVideoRef.current?.play();
            nextVideoRef.current?.pause();
            if (nextVideoRef.current) {
              nextVideoRef.current.currentTime = 0;
            }
          } catch (e) {
            console.log('Pre-play failed:', e);
          }
          
          resolve(void 0);
        };
        nextVideoRef.current?.addEventListener('canplay', handleCanPlay);
      });
      
      // 开始播放新视频（在切换前）
      nextVideoRef.current.play();
      
      // 监听视频播放结束
      const handleVideoEnded = () => {
        nextVideoRef.current?.removeEventListener('ended', handleVideoEnded);
        processNextAction();
      };
      nextVideoRef.current.addEventListener('ended', handleVideoEnded);
      
      // 等待一帧后平滑切换
      requestAnimationFrame(() => {
        setActiveVideoIndex(nextVideoIndex);
        setActionVideo(action.videoPath);
      });
    }
  };

  // 处理下一个动作
  const processNextAction = async () => {
    if (actionQueue.length > 0) {
      // 队列中有动作，播放下一个
      const nextAction = actionQueue[0];
      setActionQueue(prev => prev.slice(1));
      playAction(nextAction);
    } else {
      // 队列为空，回到默认状态
      setIsPlaying(false);
      setCurrentActionId(catConfig?.defaultAction || 'idle');
      
      // 切换回默认视频
      if (catConfig) {
        const defaultAction = catConfig.availableActions.find(action => action.id === catConfig.defaultAction);
        if (defaultAction) {
          await switchToDefaultVideo(defaultAction.videoPath);
        }
      }
      setActionVideo(null);
    }
  };

  // 切换到默认视频
  const switchToDefaultVideo = async (defaultVideoPath: string) => {
    const nextVideoIndex = activeVideoIndex === 1 ? 2 : 1;
    const nextVideoRef = nextVideoIndex === 1 ? videoRef1 : videoRef2;
    
    if (nextVideoRef.current) {
      // 加载默认视频
      nextVideoRef.current.src = defaultVideoPath;
      nextVideoRef.current.loop = true;
      nextVideoRef.current.load();
      
      // 等待加载并预播放
      await new Promise((resolve) => {
        const handleCanPlay = async () => {
          nextVideoRef.current?.removeEventListener('canplay', handleCanPlay);
          
          // 预播放视频
          try {
            await nextVideoRef.current?.play();
            nextVideoRef.current?.pause();
            if (nextVideoRef.current) {
              nextVideoRef.current.currentTime = 0;
            }
          } catch (e) {
            console.log('Pre-play failed:', e);
          }
          
          resolve(void 0);
        };
        nextVideoRef.current?.addEventListener('canplay', handleCanPlay);
      });
      
      // 开始播放
      nextVideoRef.current.play();
      
      // 平滑切换
      requestAnimationFrame(() => {
        setActiveVideoIndex(nextVideoIndex);
      });
    }
  };

  // 当猫咪变化时，重新加载视频
  useEffect(() => {
    const activeRef = activeVideoIndex === 1 ? videoRef1 : videoRef2;
    if (activeRef.current && currentVideoPath) {
      activeRef.current.src = currentVideoPath;
      // 设置默认视频为循环播放
      activeRef.current.loop = !isPlaying; // 只有在非播放状态（即默认视频）时才循环
      activeRef.current.load();
    }
  }, [currentVideoPath, activeVideoIndex, isPlaying]);

  // 当切换猫咪时，重置动作状态
  useEffect(() => {
    if (catConfig) {
      // 停止所有播放中的视频
      if (videoRef1.current) {
        videoRef1.current.pause();
        videoRef1.current.currentTime = 0;
      }
      if (videoRef2.current) {
        videoRef2.current.pause();
        videoRef2.current.currentTime = 0;
      }
      
      // 重置所有状态
      setCurrentActionId(catConfig.defaultAction);
      setActionVideo(null);
      setIsPlaying(false);
      setActionQueue([]);
      setActiveVideoIndex(1);
      
      // 清除可能存在的事件监听器
      const removeAllListeners = (videoElement: HTMLVideoElement | null) => {
        if (videoElement) {
          videoElement.onended = null;
        }
      };
      removeAllListeners(videoRef1.current);
      removeAllListeners(videoRef2.current);
    }
  }, [catConfig?.id]);

  // 监听外部动作触发事件
  useEffect(() => {
    if (actionTrigger && actionTrigger.action && catConfig) {
      // 检查动作是否属于当前猫咪
      const isValidAction = catConfig.availableActions.some(
        action => action.id === actionTrigger.action!.id
      );
      
      if (isValidAction) {
        handleActionClick(actionTrigger.action);
      }
      
      // 清除触发器
      clearTrigger();
    }
  }, [actionTrigger, catConfig, clearTrigger]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* 动态背景 - 根据当前猫咪调整 */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: currentCat ? getSceneBackground(currentCat.getState().id) : 'rgb(30, 30, 30)'
        }}
      />
      
      {/* 环境光照效果 */}
      <div className="absolute inset-0">
        {currentCat && renderEnvironmentLighting(currentCat.getState().id)}
      </div>
      
      {/* 地面阴影 - 让角色看起来站在地面上 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-8 bg-black/20 rounded-full blur-xl" style={{ marginBottom: '10px' }} />

      {/* 猫咪主体区域 */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="relative flex items-center space-x-8">
          {/* 猫咪视频/头像显示区域 */}
          <div className="w-[600px] h-[450px] relative">
            {currentCat && catConfig ? (
              <>
                {/* Emoji背景层 - 仅在没有视频时显示 */}
                {!currentVideoPath && (
                  <div className="absolute inset-0 flex items-center justify-center text-9xl animate-float z-10">
                    {getEmojiForCat(currentCat.getState().id)}
                  </div>
                )}
                
                {/* 视频播放层 - 双缓冲无缝切换 */}
                {currentVideoPath && (
                  <div className="relative w-full h-full">
                    {/* 视频背景匹配层 */}
                    <div 
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: currentCat ? getVideoBackgroundEffect(currentCat.getState().id) : 'transparent'
                      }}
                    />
                    
                    {/* 视频1 */}
                    <video
                      ref={videoRef1}
                      className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-500 ease-in-out ${
                        activeVideoIndex === 1 ? 'opacity-100 z-20' : 'opacity-0 z-10'
                      }`}
                      style={{ 
                        filter: 'contrast(1.1) brightness(1.05)',
                        mixBlendMode: 'normal'
                      }}
                      autoPlay
                      muted
                      playsInline
                      preload="metadata"
                      onError={() => {
                        console.log('Video 1 failed to load');
                      }}
                    />
                    
                    {/* 视频2 */}
                    <video
                      ref={videoRef2}
                      className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-500 ease-in-out ${
                        activeVideoIndex === 2 ? 'opacity-100 z-20' : 'opacity-0 z-10'
                      }`}
                      style={{ 
                        filter: 'contrast(1.1) brightness(1.05)',
                        mixBlendMode: 'normal'
                      }}
                      autoPlay
                      muted
                      playsInline
                      preload="metadata"
                      onError={() => {
                        console.log('Video 2 failed to load');
                      }}
                    />
                    
                    {/* 移除转换遮罩以避免闪烁 */}
                  </div>
                )}
                
                {/* 头像层 - 右上角圆形 */}
                {catConfig.avatar && (
                  <div className="absolute top-4 right-4 w-20 h-20 z-30">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white/10 backdrop-blur-sm border-2 border-white/30 shadow-lg">
                      <img
                        src={catConfig.avatar}
                        alt={catConfig.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 头像加载失败时隐藏
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* 未选择猫咪时的占位符 */
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white/50 text-2xl animate-float">请从左侧选择一只猫咪</span>
              </div>
            )}
          </div>

          {/* 动作控制按钮 */}
          {currentCat && catConfig && (
            <div className="flex flex-col space-y-3">
              <div className="mb-2">
                <h3 className="text-white/80 text-sm font-medium mb-1">动作控制</h3>
                {/* 播放状态指示 */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-xs text-white/60">
                    {isPlaying ? '播放中' : '待机中'}
                  </span>
                  {actionQueue.length > 0 && (
                    <span className="text-xs text-yellow-400">
                      队列: {actionQueue.length}
                    </span>
                  )}
                </div>
              </div>
              {catConfig.availableActions.map((action) => {
                const isInQueue = actionQueue.some(queuedAction => queuedAction.id === action.id);
                const queueCount = actionQueue.filter(queuedAction => queuedAction.id === action.id).length;
                
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    className={`
                      relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                      bg-white/10 backdrop-blur-sm border border-white/20 text-white
                      hover:bg-white/20 hover:border-white/40 hover:scale-105
                      active:scale-95 shadow-lg hover:shadow-xl
                      ${currentActionId === action.id && isPlaying ? 'bg-green-500/30 border-green-400/50' : ''}
                      ${isInQueue ? 'bg-yellow-500/20 border-yellow-400/40' : ''}
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{getActionEmoji(action.id)}</span>
                      <span>{action.name}</span>
                      {queueCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-yellow-400/60 text-yellow-900 text-xs rounded-full">
                          {queueCount}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>


      {/* 猫咪信息显示区域 */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <div className="flex items-center space-x-4 text-white">
            {currentCat && catConfig ? (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">心情:</span>
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < Math.floor(currentCat.getEmotionLevel() / 2) ? 'bg-yellow-400' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="w-px h-4 bg-white/30" />
                <div className="text-sm">
                  当前猫咪: {catConfig.name}
                </div>
                <div className="w-px h-4 bg-white/30" />
                <div className="text-sm">
                  状态: {catConfig.availableActions.find(action => action.id === catConfig.defaultAction)?.name || '待机'}
                </div>
              </>
            ) : (
              <div className="text-sm text-white/70">
                请从左侧选择一只猫咪开始互动
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatScene;