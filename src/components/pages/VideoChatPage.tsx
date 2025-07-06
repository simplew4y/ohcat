import { useState, useEffect, useRef } from 'react';
import {useLeave, useJoin} from "@/lib/useCommon";
import {useCatStore} from "@/store/catStore";
import {useSelector} from "react-redux";
import {RootState} from "@/store";

interface VideoChatPageProps {
  selectedCat: any;
  onBack: () => void;
}

const VideoChatPage = ({ selectedCat, onBack }: VideoChatPageProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideoSrc, setCurrentVideoSrc] = useState('');

  const leave = useLeave();
  const [, join] = useJoin();
  const { selectCat } = useCatStore();
  
  // 从Redux获取语音状态
  const { isAITalking } = useSelector((state: RootState) => state.room);
  
  // 根据语音状态确定视频状态：用户说话时显示idle，AI说话时显示speaking
  const isSpeaking = isAITalking;
  
  if (!selectedCat) return null;

  // 启动语音通话
  useEffect(() => {
    const startVoiceCall = async () => {
      if (isConnected || isConnecting) return;
      
      setIsConnecting(true);
      try {
        // 设置当前猫咪到store中
        selectCat(selectedCat.id);
        
        // 生成随机房间ID和用户名
        const roomId = `room_${selectedCat.id}_${Date.now()}`;
        const username = `user_${Date.now()}`;
        
        // 加入RTC房间并启动语音服务
        await join({
          username,
          roomId,
          currentCat: selectedCat,
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

  // 根据猫咪角色和状态获取对应的视频文件
  const getVideoPath = (catName: string, speaking: boolean) => {
    const videoMap: { [key: string]: { idle: string; speaking: string } } = {
      '空空': { 
        idle: '/videos/kongkong/idle.mp4',
        speaking: '/videos/kongkong/speaking.mp4'
      },
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

  // 视频切换逻辑 - 动态切换src而不是重新创建video元素
  useEffect(() => {
    const newVideoSrc = getVideoPath(selectedCat.name, isSpeaking);
    if (currentVideoSrc !== newVideoSrc) {
      setCurrentVideoSrc(newVideoSrc);
      
      const video = videoRef.current;
      if (video) {
        video.src = newVideoSrc;
        video.load();
      }
    }
  }, [selectedCat.name, isSpeaking, currentVideoSrc, getVideoPath]);

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
      {/* 视频播放区域 - 全屏猫咪视频 */}
      <div className="absolute inset-0">
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
            imgElement.src = selectedCat.avatar;
            imgElement.className = 'w-full h-full object-cover';
            imgElement.alt = selectedCat.name;
            target.parentElement?.appendChild(imgElement);
          }}
        >
          您的浏览器不支持视频播放。
        </video>
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
