interface HomePageProps {
  onCatSelect: (cat: any) => void;
}

const HomePage = ({ onCatSelect }: HomePageProps) => {
  const cards = [
    { 
      id: "kongkong",
      avatar: '/images/cats/kongkong.png', 
      name: '空空', 
      description: '曾经是战争机器，现在是和平使者。幽默，外向，擅长街舞。' 
    },
    { 
      id: "pine",
      avatar: '/images/cats/mosong.png', 
      name: '墨松', 
      description: '曾经是战争机器，现在是和平使者。幽默，外向，擅长街舞。' 
    },
    {
      id: "roasty",
      avatar: '/images/cats/mosong.png',
      name: '罗西',
      description: '曾经是战争机器，现在是和平使者。幽默，外向，擅长街舞。'
    },
    { 
      id: "ogle",
      avatar: '/images/cats/aoger.png', 
      name: '奥格尔', 
      description: '曾经是战争机器，现在是和平使者。幽默，外向，擅长街舞。' 
    },
    { 
      id: "mianmian",
      avatar: '/images/cats/mianmian.png', 
      name: '绵绵', 
      description: '曾经是战争机器，现在是和平使者。幽默，外向，擅长街舞。' 
    },
    { 
      id: "oga",
      avatar: '/images/cats/aojia.png', 
      name: '奥迦', 
      description: '曾经是战争机器，现在是和平使者。幽默，外向，擅长街舞。' 
    },
  ];

  return (
    <div className="relative h-full">
      {/* SVG滤镜定义 */}
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

      {/* 内容容器 - 添加内边距 */}
      <div className="h-full">
        <div className="max-w-6xl mx-auto">
          {/* 标题 */}
          <div className="mb-12">
            <h1 className="text-black text-xl font-medium">OHCAT星球</h1>
          </div>
          
          {/* 卡片网格容器 */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <div
                key={card.id}
                className="liquidGlass-wrapper card h-56"
                onClick={() => onCatSelect(card)}
              >
                <div className="liquidGlass-effect"></div>
                <div className="liquidGlass-tint"></div>
                <div className="liquidGlass-shine"></div>
                <div className="liquidGlass-text w-full h-full relative flex flex-col justify-between">
                  {/* 头像 */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/20 flex items-center justify-center">
                    <img 
                      src={card.avatar} 
                      alt={card.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<span class="text-lg">🐱</span>';
                      }}
                    />
                  </div>
                  
                  {/* 文字内容区域 */}
                  <div>
                    {/* 名字 */}
                    <h3 className="text-black text-lg font-semibold mb-2">{card.name}</h3>
                    
                    {/* 描述 */}
                    <p className="text-black text-sm leading-relaxed opacity-80">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;