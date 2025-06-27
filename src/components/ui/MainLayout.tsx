'use client';

import { ReactNode } from 'react';
import FloatingNavigation from './FloatingNavigation';
import ChatInterface from './ChatInterface';
import CatScene from '../cats/CatScene';
import { Provider, useSelector } from 'react-redux';
import store from "@/store";


interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
      <Provider store={store}>
    <div className="relative w-full h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' }}>
      {/* 简化的装饰效果 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="subtle-texture"></div>
      </div>
      
      {/* 猫咪场景 - 主要内容区域 */}
      <div className="relative z-10 w-full h-full">
        <CatScene />
      </div>
      
      {/* 左侧悬浮导航 */}
      <FloatingNavigation />
      
      {/* 底部对话界面 */}
      <ChatInterface />
      
      {/* 其他悬浮内容 */}
      {children}
      
      {/* 全局样式 */}
      <style jsx>{`
        .subtle-texture {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
        }
        
        .subtle-texture::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(1px 1px at 50px 80px, rgba(255,200,200,0.1), transparent),
            radial-gradient(1px 1px at 120px 40px, rgba(255,150,150,0.08), transparent),
            radial-gradient(1px 1px at 200px 120px, rgba(255,180,180,0.06), transparent);
          background-repeat: repeat;
          background-size: 300px 200px;
          animation: gentle-glow 8s ease-in-out infinite alternate;
        }
        
        @keyframes gentle-glow {
          0% { opacity: 0.2; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
      </Provider>
  );
};

export default MainLayout;