'use client'; // 如果是 Next.js app dir 下的 client component

import { ReactNode, useState } from 'react';
import { Provider } from 'react-redux';
import store from "@/store";
import HomePage from '../pages/HomePage';
import GamePage from '../pages/GamePage';
import ChatPage from '../pages/ChatPage';
import CarePage from '../pages/CarePage';
import SettingsPage from '../pages/SettingsPage';
import VideoChatPage from '../pages/VideoChatPage';

interface CatInfo {
  id: string;
  [key: string]: any;
}

const MainLayout = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCat, setSelectedCat] = useState<CatInfo | null>(null);
  const [inVideoCall, setInVideoCall] = useState(false);

  const bottomTabs = [
    { icon: '🏠' },
    { icon: '🎮' }, 
    { icon: '💬' },
    { icon: '❤️' },
    { icon: '⚙️' }
  ];

  return (
    <Provider store={store}>
      <div className="app-container">
        {/* 主要内容区域 */}
        <div className="main-content">
          {inVideoCall ? (
            <VideoChatPage selectedCat={selectedCat} onBack={() => setInVideoCall(false)} />
          ) : (
            <>
              {activeTab === 0 && <HomePage onCatSelect={(cat: CatInfo) => { setSelectedCat(cat); setActiveTab(2); }} />}
              {activeTab === 1 && <GamePage />}
              {activeTab === 2 && <ChatPage key={selectedCat?.id} selectedCat={selectedCat} onBack={() => { setActiveTab(0); setSelectedCat(null); }} onVideoCall={() => setInVideoCall(true)} />}
              {activeTab === 3 && <CarePage />}
              {activeTab === 4 && <SettingsPage />}
            </>
          )}
        </div>

        {/* 底部导航栏 (视频通话时不显示) */}
        {!inVideoCall && (
          <div className="bottom-navigation">
            {bottomTabs.map((tab, index) => (
              <button
                key={index}
                className={`nav-button ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                <span className="nav-icon">{tab.icon}</span>
              </button>
            ))}
          </div>
        )}

        {/* 全局样式 */}
        <style jsx>{`
          .app-container {
            position: relative;
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            background: url('/images/bg/background.png'); background-size: cover; background-position: center;
            background-attachment: fixed;
            overflow: hidden;
          }

          .main-content {
            flex: 1;
            position: relative;
            overflow-y: auto;
            padding: 20px 16px 90px 16px;
          }


          .bottom-navigation {
            display: flex;
            height: 70px;
            background: transparent;
            padding: 8px 16px;
            gap: 8px;
            z-index: 100;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
          }

          .nav-button {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 12px 8px;
            border-radius: 12px;
            margin: 0 2px;
          }

          .nav-button:hover {
            color: rgba(255, 255, 255, 0.9);
            transform: scale(1.1);
          }

          .nav-button.active {
            color: #ff69b4;
            transform: scale(1.15);
          }

          .nav-button.active .nav-icon {
            filter: drop-shadow(0 0 12px #ff69b4) drop-shadow(0 0 20px rgba(255, 105, 180, 0.5));
          }

          .nav-icon {
            font-size: 28px;
            transition: all 0.3s ease;
          }

          @keyframes gentle-drift {
            0%, 100% { 
              transform: translateX(0) translateY(0) rotate(0deg);
              opacity: 0.8;
            }
            25% { 
              transform: translateX(20px) translateY(-10px) rotate(1deg);
              opacity: 0.6;
            }
            50% { 
              transform: translateX(-10px) translateY(20px) rotate(-0.5deg);
              opacity: 0.9;
            }
            75% { 
              transform: translateX(15px) translateY(5px) rotate(0.5deg);
              opacity: 0.7;
            }
          }

          /* 响应式优化 */
          @media (max-width: 768px) {
            .main-content {
              padding: 16px 12px 80px 12px;
            }
            .bottom-navigation {
              height: 60px;
              padding: 6px 12px;
            }
            .nav-button {
              padding: 10px 6px;
              margin: 0 1px;
            }
            .nav-icon {
              font-size: 24px;
            }
          }

          @media (max-width: 480px) {
            .main-content {
              padding: 12px 8px 75px 8px;
            }
            .bottom-navigation {
              height: 55px;
              padding: 4px 8px;
            }
            .nav-button {
              padding: 8px 4px;
              margin: 0 1px;
            }
            .nav-icon {
              font-size: 22px;
            }
          }
        `}</style>
      </div>
    </Provider>
  );
};

export default MainLayout;
