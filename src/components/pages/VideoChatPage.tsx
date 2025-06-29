import { useState } from 'react';

interface VideoChatPageProps {
  selectedCat: any;
  onBack: () => void;
}

const VideoChatPage = ({ selectedCat, onBack }: VideoChatPageProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  if (!selectedCat) return null;

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
        idle: '/videos/cats/mianmian_idle.mp4',
        speaking: '/videos/cats/mianmianspeaking.mp4'
      },
      '墨松': { 
        idle: '/videos/cats/mosongidle.mp4',
        speaking: '/videos/cats/mosongspeaking.mp4'
      },
      '招财猫': {   
        idle: '/videos/cats/zhaocaimaoidle.mp4',
        speaking: '/videos/cats/zhaocaimaospeaking.mp4'
      }
    };
    
    const catVideos = videoMap[catName] || { 
      idle: '/videos/cats/default_idle.mp4',
      speaking: '/videos/cats/default_speaking.mp4'
    };
    
    return speaking ? catVideos.speaking : catVideos.idle;
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 视频播放区域 - 全屏猫咪视频 */}
      <div className="absolute inset-0">
        <video
          key={`${selectedCat.name}-${isSpeaking}`} // 确保切换状态时重新加载视频
          autoPlay
          loop
          muted
          playsInline
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
          <source src={getVideoPath(selectedCat.name, isSpeaking)} type="video/mp4" />
          您的浏览器不支持视频播放。
        </video>
      </div>

      {/* 测试开关 - 右上角 */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setIsSpeaking(!isSpeaking)}
          className="px-4 py-2 bg-black/30 hover:bg-black/50 text-white rounded-lg transition-all duration-300 backdrop-blur-sm text-sm font-medium"
        >
          {isSpeaking ? '说话中' : '默认状态'}
        </button>
      </div>

      {/* 挂断按钮 - 底部中央 */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
        <button 
          onClick={onBack}
          className="p-6 bg-black/30 hover:bg-black/50 rounded-full transition-all duration-300 backdrop-blur-sm"
        >
          <svg className="w-16 h-16" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <path d="M509.64 63c-247.7 0-448.5 200.8-448.5 448.5S261.94 960 509.64 960s448.5-200.8 448.5-448.5S757.34 63 509.64 63z m215.61 530.32c-24.18 0-67.4-13.89-84.9-19.55s-24.18-12.86-28.81-39.62-23.15-36-44.25-37c-14.07-0.68-36.82-0.68-50.42-0.61v0.1l-5.66-0.06-5.66 0.06v-0.1c-13.61-0.07-36.36-0.07-50.43 0.61-21.09 1-39.62 10.29-44.25 37s-11.32 34-28.81 39.62-60.71 19.55-84.9 19.55s-28.3-58.66-28.3-58.66c0-76.66 190.89-97.76 216.14-97.76h52.48c25.21 0 216.1 21.1 216.1 97.76-0.03 0-4.14 58.66-28.33 58.66z" fill="#FF3B30" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default VideoChatPage;