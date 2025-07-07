import { useState, useEffect, useRef, useCallback } from 'react';
import {useLeave, useJoin} from "@/lib/useCommon";
import {useCatStore} from "@/store/catStore";
import {useSelector} from "react-redux";
import {RootState} from "@/store";
import { CatConfig } from '@/types/cat';
import { VirtualCat } from '@/lib/cat';
interface VideoChatPageProps {
  selectedCat: CatConfig | null;
  onBack: () => void;
}

// 动画配置接口
interface AnimationProps {
  path: string;
  totalFrames: number;
  repeat?: number;
}

interface AnimationCache {
  [key: string]: HTMLImageElement[];
}

// 空空的动画配置
const KongKongListenAnimations: AnimationProps[] = [
  {
    path: '4-stand',
    totalFrames: 180,
    repeat: 3,
  },
];

const KongKongTalkAnimations: AnimationProps[] = [
  {
    path: '1-talk',
    totalFrames: 310,
  },
];

const VideoChatPage = ({ selectedCat, onBack }: VideoChatPageProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoSrc, setCurrentVideoSrc] = useState('');

  // 动画相关状态
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const completedCycles = useRef(0);
  
  const [currentFrame, setCurrentFrame] = useState(0);
  const [frames, setFrames] = useState<HTMLImageElement[]>([]);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationProps | null>(null);
  const [animationCache, setAnimationCache] = useState<AnimationCache>({});
  const [isAnimationLoading, setIsAnimationLoading] = useState(true);

  const leave = useLeave();
  const [, join] = useJoin();
  const { selectCat } = useCatStore();
  
  // 从Redux获取语音状态
  const { isAITalking } = useSelector((state: RootState) => state.room);
  
  // 根据语音状态确定视频状态：用户说话时显示idle，AI说话时显示speaking
  const isSpeaking = isAITalking;
  
  const fps = 30;
  
  // 启动语音通话
  useEffect(() => {
    if (!selectedCat) return;
    
    const startVoiceCall = async () => {
      if (isConnected || isConnecting) return;
      
      setIsConnecting(true);
      try {
        // 设置当前猫咪到store中
        selectCat(selectedCat.id);
        
        // 生成随机房间ID和用户名
        const roomId = `room_${selectedCat.id}_${Date.now()}`;
        const username = `user_${Date.now()}`;
        
        // 创建 VirtualCat 实例
        const virtualCat = new VirtualCat(selectedCat);
        
        // 加入RTC房间并启动语音服务
        await join({
          username,
          roomId,
          currentCat: virtualCat,
          publishAudio: true
        }, false);
        
        setIsConnected(true);
        console.log('语音通话已启动');
      } catch (error) {
        console.error('启动语音通话失败:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    startVoiceCall();
  }, [selectedCat, join, isConnected, isConnecting, selectCat]);

  if (!selectedCat) return null;

  // 根据猫咪角色和状态获取对应的视频文件或动画路径
  const getVideoPath = (catName: string, speaking: boolean) => {
    const videoMap: { [key: string]: { idle: string; speaking: string } } = {
      '奥格尔': { 
        idle: '/videos/aoger/idle.mp4',
        speaking: '/videos/aoger/speaking.mp4'
      },
      '奥迦': { 
        idle: '/videos/aojia/idle.mp4',
        speaking: '/videos/aojia/speaking.mp4'
      },
      '绵绵': { 
        idle: '/videos/mianmian/idle.mp4',
        speaking: '/videos/mianmian/speaking.mp4'
      },
      '墨松': { 
        idle: '/videos/mosong/idle.mp4',
        speaking: '/videos/mosong/speaking.mp4'
      },
      '罗西': { 
        idle: '/videos/roasty/idle.mp4',
        speaking: '/videos/roasty/angry.mp4'
      }
    };
    
    const catVideos = videoMap[catName] || { 
      idle: '/videos/roasty/idle.mp4',
      speaking: '/videos/roasty/angry.mp4'
    };
    
    return speaking ? catVideos.speaking : catVideos.idle;
  };

  // 获取空空的动画列表
  const getKongKongAnimations = useCallback(() => {
    return isSpeaking ? KongKongTalkAnimations : KongKongListenAnimations;
  }, [isSpeaking]);

  // 获取所有空空动画
  const getAllKongKongAnimations = useCallback(() => {
    const allAnimations = [
      ...KongKongListenAnimations,
      ...KongKongTalkAnimations,
    ];

    // 去重
    const uniqueAnimations = allAnimations.reduce((acc, current) => {
      const existingAnimation = acc.find(anim => anim.path === current.path);
      if (!existingAnimation) {
        acc.push(current);
      }
      return acc;
    }, [] as AnimationProps[]);

    return uniqueAnimations;
  }, []);

  // 加载单个动画的帧
  const loadAnimationFrames = useCallback(async (animation: AnimationProps): Promise<HTMLImageElement[]> => {
    const frameNumbers = Array.from({ length: animation.totalFrames }, (_, i) => i + 1);
    const frameFiles = frameNumbers.map((num) => `${num.toString().padStart(4, '0')}.webp`);

    const imagePromises = frameFiles.map((frame) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${frame}`));
        img.src = `/animation/${animation.path}/${frame}`;
      });
    });

    return Promise.all(imagePromises);
  }, []);

  // 预加载所有空空动画
  useEffect(() => {
    if (selectedCat.name !== '空空') return;

    const preloadAllAnimations = async () => {
      try {
        setIsAnimationLoading(true);
        const allAnimations = getAllKongKongAnimations();
        const cache: AnimationCache = {};

        // 并行加载所有动画
        const loadPromises = allAnimations.map(async (animation) => {
          const frames = await loadAnimationFrames(animation);
          cache[animation.path] = frames;
        });

        await Promise.all(loadPromises);
        setAnimationCache(cache);

        // 设置初始动画
        const animations = getKongKongAnimations();
        const initialAnimation = animations[0];
        setCurrentAnimation(initialAnimation);
        setFrames(cache[initialAnimation.path] || []);
        setIsAnimationLoading(false);

        console.log('Kong Kong animations preloaded successfully');
      } catch (error) {
        console.error('Error preloading Kong Kong animations:', error);
        setIsAnimationLoading(false);
      }
    };

    preloadAllAnimations();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedCat.name, getAllKongKongAnimations, loadAnimationFrames, getKongKongAnimations]);

  // 当动画改变时从缓存更新帧
  useEffect(() => {
    if (currentAnimation && animationCache[currentAnimation.path]) {
      setFrames(animationCache[currentAnimation.path]);
      setCurrentFrame(0);
      completedCycles.current = 0;
    }
  }, [currentAnimation, animationCache]);

  // 处理动画类型变化
  useEffect(() => {
    if (selectedCat.name === '空空' && !isAnimationLoading && Object.keys(animationCache).length > 0) {
      const animations = getKongKongAnimations();
      const newAnimation = animations[0];
      if (currentAnimation?.path !== newAnimation.path) {
        setCurrentAnimation(newAnimation);
      }
    }
  }, [isSpeaking, isAnimationLoading, animationCache, getKongKongAnimations, currentAnimation, selectedCat.name]);

  // 绘制当前帧
  const drawFrame = useCallback((frameIndex: number) => {
    if (!canvasRef.current || frames.length === 0 || frameIndex >= frames.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const image = frames[frameIndex];
    if (!image) return;

    // 计算缩放比例保持宽高比
    const scaleX = canvas.width / image.width;
    const scaleY = canvas.height / image.height;
    const scale = Math.min(scaleX, scaleY);

    // 计算居中位置
    const x = (canvas.width - image.width * scale) / 2;
    const y = (canvas.height - image.height * scale) / 2;

    // 绘制图像
    ctx.drawImage(
      image,
      0,
      0,
      image.width,
      image.height,
      x,
      y,
      image.width * scale,
      image.height * scale
    );
  }, [frames]);

  // 处理画布大小调整
  useEffect(() => {
    if (selectedCat.name !== '空空') return;

    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const container = containerRef.current;
        const canvas = canvasRef.current;

        // 设置画布尺寸
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // 重新绘制当前帧
        drawFrame(currentFrame);
      }
    };

    // 初始化尺寸
    handleResize();

    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentFrame, drawFrame, selectedCat.name]);

  // 动画循环
  useEffect(() => {
    if (selectedCat.name !== '空空' || frames.length === 0 || !currentAnimation || isAnimationLoading) return;

    let lastFrameTime = 0;
    const frameDuration = 1000 / fps;

    const animate = (timestamp: number) => {
      if (!lastFrameTime) lastFrameTime = timestamp;

      const elapsed = timestamp - lastFrameTime;

      if (elapsed > frameDuration) {
        setCurrentFrame((prev) => {
          const nextFrame = (prev + 1) % frames.length;

          // 如果完成了一个完整循环
          if (nextFrame === 0) {
            completedCycles.current += 1;

            // 如果已经播放了指定次数，移动到下一个动画
            if (completedCycles.current >= (currentAnimation.repeat || 1)) {
              const animations = getKongKongAnimations();
              const currentIndex = animations.findIndex(
                (anim) => anim.path === currentAnimation.path
              );
              const nextIndex = (currentIndex + 1) % animations.length;
              setCurrentAnimation(animations[nextIndex]);
            }
          }

          return nextFrame;
        });
        lastFrameTime = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [frames, currentAnimation, getKongKongAnimations, isAnimationLoading, selectedCat.name]);

  // 绘制当前帧
  useEffect(() => {
    if (selectedCat.name === '空空') {
      drawFrame(currentFrame);
    }
  }, [currentFrame, frames, drawFrame, selectedCat.name]);

  // 视频切换逻辑 - 仅对非空空猫咪处理
  useEffect(() => {
    if (selectedCat.name !== '空空') {
      const newVideoSrc = getVideoPath(selectedCat.name, isSpeaking);
      if (currentVideoSrc !== newVideoSrc) {
        setCurrentVideoSrc(newVideoSrc);
        
        const video = videoRef.current;
        if (video) {
          video.src = newVideoSrc;
          video.load();
        }
      }
    }
  }, [selectedCat.name, isSpeaking, currentVideoSrc]);

  const endVideoCall = async () => {
    try {
      if (isConnected) {
        await leave();
        setIsConnected(false);
        console.log('语音通话已结束');
      }
    } catch (error) {
      console.error('结束语音通话失败:', error);
    } finally {
      onBack();
    }
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 视频播放区域 - 全屏猫咪视频或动画 */}
      <div className="absolute inset-0">
        {selectedCat.name === '空空' ? (
          <div
            ref={containerRef}
            className="w-full h-full"
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              background: 'transparent',
              minWidth: '100%',
              minHeight: '100%'
            }}
          >
            {isAnimationLoading ? (
              <div className="flex items-center justify-center w-full h-full">
                <span className="text-white">加载动画中...</span>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                }}
              />
            )}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
            style={{ minWidth: '100%', minHeight: '100%' }}
            onError={(e) => {
              console.error('视频加载失败:', e);
              // 视频加载失败时显示猫咪图片
              const target = e.target as HTMLVideoElement;
              target.style.display = 'none';
              const imgElement = document.createElement('img');
              imgElement.src = selectedCat.avatar || '/default-avatar.png';
              imgElement.className = 'w-full h-full object-cover';
              imgElement.alt = selectedCat.name;
              target.parentElement?.appendChild(imgElement);
            }}
          >
            您的浏览器不支持视频播放。
          </video>
        )}
      </div>

      {/* 连接状态指示器 - 左上角 */}
      <div className="absolute top-6 left-6 z-50">
        <div className="px-4 py-2 bg-black/30 text-white rounded-lg backdrop-blur-sm text-sm font-medium">
          {isConnecting ? '连接中...' : isConnected ? '语音已连接' : '连接失败'}
          <div className={`w-2 h-2 rounded-full ml-2 inline-block ${
            isConnecting ? 'bg-yellow-500 animate-pulse' : 
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </div>
      </div>

      {/* 挂断按钮 - 底部中央 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <button 
          onClick={endVideoCall}
          className="p-6 bg-black/30 hover:bg-black/50 rounded-full transition-all duration-300 backdrop-blur-sm"
        >
          <svg className="w-16 h-16" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path d="M509.64 63c-247.7 0-448.5 200.8-448.5 448.5S261.94 960 509.64 960s448.5-200.8 448.5-448.5S757.34 63 509.64 63z m215.61 530.32c-24.18 0-67.4-13.89-84.9-19.55s-24.18-12.86-28.81-39.62-23.15-36-44.25-37c-14.07-0.68-36.82-0.68-50.42-0.61v0.1l-5.66-0.06-5.66 0.06v-0.1c-13.61-0.07-36.36-0.07-50.43 0.61-21.09 1-39.62 10.29-44.25 37s-11.32 34-28.81 39.62-60.71 19.55-84.9 19.55s-28.3-58.66-28.3-58.66c0-76.66 190.89-97.76 216.14-97.76h52.48c25.21 0 216.1 21.1 216.1 97.76-0.03 0-4.14 58.66-28.33 58.66z" fill="#FF69B4" fillOpacity="0.5" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VideoChatPage;
