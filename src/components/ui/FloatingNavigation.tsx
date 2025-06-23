'use client';

import { useState } from 'react';
import { useCatStore } from '@/store/catStore';

const FloatingNavigation = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const navItems = [
    { id: 'cats', icon: '🐱', label: '猫咪选择', color: 'from-pink-500 to-purple-600' },
    { id: 'shop', icon: '🛒', label: '商城', color: 'from-emerald-500 to-teal-600' },
    { id: 'inventory', icon: '🎒', label: '背包', color: 'from-amber-500 to-orange-600' },
    { id: 'settings', icon: '⚙️', label: '设置', color: 'from-slate-500 to-gray-600' },
  ];

  const togglePanel = (panelId: string) => {
    setActivePanel(activePanel === panelId ? null : panelId);
  };

  return (
    <>
      {/* 左侧导航栏 */}
      <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-50">
        <div className="flex flex-col space-y-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => togglePanel(item.id)}
              className={`
                relative group w-16 h-16 rounded-2xl
                bg-gradient-to-br ${item.color}
                backdrop-blur-md bg-opacity-20
                border border-white/20
                shadow-lg shadow-black/25
                hover:shadow-xl hover:shadow-black/40
                hover:scale-110
                transition-all duration-300
                flex items-center justify-center
                ${activePanel === item.id ? 'scale-110 shadow-xl' : ''}
              `}
            >
              {/* 玻璃反光效果 */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              
              {/* 图标 */}
              <span className="text-2xl filter drop-shadow-lg">{item.icon}</span>
              
              {/* 悬浮提示 */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap backdrop-blur-sm">
                {item.label}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-black/80 rotate-45" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 悬浮面板 */}
      {activePanel && (
        <div className="fixed left-28 top-1/2 transform -translate-y-1/2 z-40">
          <div className="w-80 h-96 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black/50 p-6">
            {/* 面板标题 */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl font-semibold">
                {navItems.find(item => item.id === activePanel)?.label}
              </h3>
              <button
                onClick={() => setActivePanel(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            {/* 面板内容 */}
            <div className="h-full overflow-y-auto">
              {activePanel === 'cats' && <CatSelectionPanel />}
              {activePanel === 'shop' && <ShopPanel />}
              {activePanel === 'inventory' && <InventoryPanel />}
              {activePanel === 'settings' && <SettingsPanel />}
            </div>
          </div>
        </div>
      )}

      {/* 背景遮罩 */}
      {activePanel && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setActivePanel(null)}
        />
      )}
    </>
  );
};

// 猫咪选择面板
const CatSelectionPanel = () => {
  const { getAllCatConfigs } = require('@/lib/catConfigs');
  const { selectCat, currentCat } = useCatStore();
  const cats = getAllCatConfigs();
  
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

  const handleCatSelect = (catId: string) => {
    selectCat(catId);
  };

  return (
    <div className="space-y-4">
      {cats.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleCatSelect(cat.id)}
          className={`w-full p-4 rounded-2xl bg-gradient-to-r transition-all duration-300 text-left group ${
            currentCat?.getState().id === cat.id 
              ? 'from-blue-500/30 to-purple-500/30 border-blue-400/50' 
              : 'from-white/10 to-white/5 border-white/10 hover:border-white/30'
          } border`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-2xl">
              {getEmojiForCat(cat.id)}
            </div>
            <div>
              <h4 className="text-white font-medium">{cat.name}</h4>
              <p className="text-white/70 text-sm">{cat.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

// 商城面板
const ShopPanel = () => (
  <div className="space-y-4">
    <div className="text-white/70 text-center py-8">
      <div className="text-4xl mb-4">🛒</div>
      <p>商城功能开发中...</p>
    </div>
  </div>
);

// 背包面板
const InventoryPanel = () => (
  <div className="space-y-4">
    <div className="text-white/70 text-center py-8">
      <div className="text-4xl mb-4">🎒</div>
      <p>背包功能开发中...</p>
    </div>
  </div>
);

// 设置面板
const SettingsPanel = () => (
  <div className="space-y-4">
    <div className="text-white/70 text-center py-8">
      <div className="text-4xl mb-4">⚙️</div>
      <p>设置功能开发中...</p>
    </div>
  </div>
);

export default FloatingNavigation;