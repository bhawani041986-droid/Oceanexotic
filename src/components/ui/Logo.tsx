import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'color';
}

export const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 'md', 
  variant = 'color' 
}) => {
  const id = useId().replace(/:/g, '');
  const containerSizes = {
    sm: { width: '144px', height: '36px' },
    md: { width: '216px', height: '54px' },
    lg: { width: '288px', height: '72px' },
    xl: { width: '432px', height: '108px' },
  };

  const textFill = variant === 'light' ? '#FFFFFF' : variant === 'dark' ? '#000000' : 'var(--foreground)';
  const primaryFill = variant === 'light' ? '#FFFFFF' : variant === 'dark' ? '#000000' : 'var(--primary, #00D1FF)';

  return (
    <div className={cn("inline-flex items-center group", className)} style={containerSizes[size]}>
      <style jsx>{`
        @keyframes neonTravel {
          0% { stroke-dashoffset: 1500; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes hairyPulse {
          0% { filter: drop-shadow(0 0 1px #00D1FF) drop-shadow(0 0 2px #F0ABFC); }
          33% { filter: drop-shadow(0 0 1.5px #FACC15) drop-shadow(0 0 2.5px #00D1FF); }
          66% { filter: drop-shadow(0 0 1px #F0ABFC) drop-shadow(0 0 2px #FACC15); }
          100% { filter: drop-shadow(0 0 1px #00D1FF) drop-shadow(0 0 2px #F0ABFC); }
        }
        .neon-path {
          stroke-dasharray: 200 1300;
          animation: neonTravel 3s linear infinite;
        }
        .hairy-glow {
          animation: hairyPulse 4s ease-in-out infinite;
          transform-origin: center;
        }
        .rgb-eye {
          fill: url(#eyeGradient-${id});
          filter: drop-shadow(0 0 5px #00D1FF);
        }
      `}</style>

      <svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMinYMid meet">
        <defs>
          <linearGradient id={`neonGradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D1FF">
              <animate attributeName="stop-color" values="#00D1FF;#F0ABFC;#FACC15;#00D1FF" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#F0ABFC">
              <animate attributeName="stop-color" values="#F0ABFC;#FACC15;#00D1FF;#F0ABFC" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          <radialGradient id={`eyeGradient-${id}`}>
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#00D1FF">
               <animate attributeName="stop-color" values="#00D1FF;#F0ABFC;#FACC15;#00D1FF" dur="2s" repeatCount="indefinite" />
            </stop>
          </radialGradient>

          <mask id={`mask-${id}`}>
            <rect x="0" y="0" width="100" height="100" fill="white" />
            <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" fill="black" fontSize="24" fontWeight="900" fontFamily="Inter, sans-serif" fontStyle="italic" style={{ letterSpacing: '-1px' }}>OX</text>
            <line x1="38" y1="44" x2="15" y2="44" stroke="black" strokeWidth="2.5" />
            <line x1="62" y1="58" x2="88" y2="58" stroke="black" strokeWidth="2.5" />
            <circle cx="82" cy="48" r="4" fill="black" />
          </mask>
        </defs>
        
        <g className="hairy-glow" transform="translate(60, 55) scale(1.15)">
          <path 
            fill={primaryFill}
            d="M50 20 C35 20 20 30 15 50 L5 30 L5 70 L15 50 C20 70 35 80 50 80 C70 80 85 70 90 50 C85 30 70 20 50 20 Z M50 20 C55 10 65 5 75 5 C65 5 55 10 50 20 Z M50 80 C55 90 65 95 75 95 C65 95 55 90 50 80 Z" 
            mask={`url(#mask-${id})`} 
          />
          <circle className="rgb-eye" cx="82" cy="48" r="3" style={{ fill: `url(#eyeGradient-${id})` }} />
        </g>
        
        <g transform="translate(141, 100)">
          <path 
            className="neon-path"
            d="M0, -45 L420, -45 L420, 50 L0, 50 L0, -45" 
            fill="none" 
            stroke={`url(#neonGradient-${id})`} 
            strokeWidth="3" 
            strokeLinecap="round"
            opacity="0.8"
          />
          
          <text 
            fill={textFill}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '58px', letterSpacing: '-0.06em', textTransform: 'uppercase' }}
            dominantBaseline="middle"
            x="0" y="0"
          >
            OceanExotic
          </text>
          
          <g transform="translate(0, 38)">
            <rect fill={primaryFill} x="0" y="-8" width="50" height="5" rx="2.5" />
            <text 
              fill={primaryFill}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 900, fontStyle: 'italic', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '0.4em' }}
              x="65" y="0"
            >
              GLOBAL
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
