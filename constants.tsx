
import React from 'react';
import type { GameTheme, PieceStyle, Cosmetic, BotProfile, Avatar, Emoji, PieceEffect } from './types';

// --- Game Settings ---
export const BOARD_SIZE = 15;
export const WINNING_LENGTH = 5;
export const INITIAL_GAME_TIME = 900; // 15 minutes total for the game
export const TURN_TIME = 180; // 3 minutes per turn

// --- Rewards and Levels ---
export const COIN_REWARD = {
    win: 50,
    draw: 20,
    loss: 10,
};
export const XP_REWARD = {
    win: 30,
    draw: 10,
    loss: 5,
};
export const getXpForNextLevel = (level: number) => 100 + (level - 1) * 50;


// --- SVG Icon Components ---
const Hexagon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M17.2,3H6.8l-5.2,9l5.2,9h10.4l5.2-9L17.2,3z"/></svg>);
const Triangle: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12,2L1,21h22L12,2z"/></svg>);
const Plus: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>);
const Sun: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.03-3.58 2.37-6.53 5.5-7.65L8.5 3.5C4.73 4.83 2 8.57 2 13zm18 0c0-4.43-3.27-8.17-7.5-9.5L11.5 5.35c3.13 1.12 5.47 4.07 5.5 7.65h2zM12 5V3c4.42 0 8 3.58 8 8h-2c0-3.31-2.69-6-6-6zm0 14v2c-4.42 0-8-3.58-8-8h2c0 3.31 2.69 6 6 6z"/></svg>);
const PawPrint: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-4-4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-4 4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-1-6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>);
const Ghost: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.69 2 6 4.69 6 8v6c0 1.1.9 2 2 2h2v4h4v-4h2c1.1 0 2-.9 2-2V8c0-3.31-2.69-6-6-6zm-2 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>);
const PeaceSign: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v5.5l3.5 3.5-1.42 1.42L11 13.41V7z"/></svg>);
const Circle: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12"/></svg>);
const Cross: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 10 L90 90 M90 10 L10 90" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/></svg>);

const Diamond: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 L2 12 L12 22 L22 12 Z"/></svg>);
const Star: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>);
const Heart: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>);
const MusicNote: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>);
const Bolt: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>);
const Planet: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.25.58-.56 1.12-.9 1.6l-2.8-2.81c.81-.43 1.51-1.03 2-1.79.49-.76.79-1.68.8-2.65.01-.98-.24-1.92-.7-2.75l1.45-1.45C18.53 7.8 19 9.83 19 12c0 2.21-.81 4.24-2.1 5.86v.01z"/></svg>);
const Rocket: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.17l-3.17-3.17 1.41-1.41 1.76 1.76V7h2v6.17l1.76-1.76 1.41 1.41L13 16.17z"/></svg>);
const Shield: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>);
const Square: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M3 3v18h18V3H3zm16 16H5V5h14v14z"/></svg>);
const Moon: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11.5 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-4.09-2.7-7.54-6.42-8.62C13.43 4.12 12.5 4 11.5 4z"/></svg>);
const Anchor: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v4h3v2h-3v4h-2v-4H8v-2h3V6z"/></svg>);
const Bug: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19 8h-1.81c-.45-1.73-1.98-3-3.88-3s-3.43 1.27-3.88 3H7.69l-1.63 4.9A2 2 0 0 0 8 15h8a2 2 0 0 0 1.94-2.1L16.31 8h1.88c.55 0 1-.45 1-1s-.45-1-1-1zm-7 8c-1.66 0-3-1.34-3-3h6c0 1.66-1.34 3-3 3z"/></svg>);
const Crown: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/></svg>);
const Eye: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 13c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/></svg>);
const Fire: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 1.5c-3.1 0-5.4 2.3-5.4 5.4 0 2 .9 3.7 2.3 4.7-1.3 1.1-2.2 2.7-2.2 4.5 0 3.2 2.6 5.8 5.8 5.8s5.8-2.6 5.8-5.8c0-1.9-.9-3.5-2.2-4.5 1.4-1 2.3-2.7 2.3-4.7 0-3.1-2.3-5.4-5.4-5.4z"/></svg>);
const Flag: React.FC<{ className?: string }> = ({ className }) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/></svg>);

const Avatar1: React.FC<{ className?: string }> = ({ className }) => (<img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="avatar" className={`rounded-full ${className}`} />);
const Avatar2: React.FC<{ className?: string }> = ({ className }) => (<img src="https://i.pravatar.cc/150?u=a042581f4e29026705d" alt="avatar" className={`rounded-full ${className}`} />);
const Avatar3: React.FC<{ className?: string }> = ({ className }) => (<img src="https://i.pravatar.cc/150?u=a042581f4e29026706d" alt="avatar" className={`rounded-full ${className}`} />);


// --- Theme Decorators ---
const IceThemeDecorator: React.FC = React.memo(() => (
    <>
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(25)].map((_, i) => (
                <div key={i} className="absolute text-cyan-200/50" style={{
                    top: '-10%',
                    left: `${-10 + Math.random() * 120}%`,
                    fontSize: `${0.8 + Math.random() * 1.2}rem`,
                    animationName: 'snowfall, sway',
                    animationDuration: `${10 + Math.random() * 10}s, ${4 + Math.random() * 4}s`,
                    animationDelay: `${Math.random() * 15}s, ${Math.random() * 4}s`,
                    animationTimingFunction: 'linear, ease-in-out',
                    animationIterationCount: 'infinite, infinite',
                    // @ts-ignore
                    '--sway-amount': `${(Math.random() - 0.5) * 80}px`,
                }}>
                    ❄
                </div>
            ))}
        </div>
        <style>{`
            @keyframes snowfall {
                from {
                    transform: translateY(0vh) rotate(0deg);
                    opacity: 1;
                }
                to {
                    transform: translateY(105vh) rotate(720deg);
                    opacity: 0;
                }
            }
             @keyframes sway {
                0%, 100% { margin-left: 0; }
                50% { margin-left: var(--sway-amount); }
            }
        `}</style>
    </>
));
const RetroThemeDecorator: React.FC = React.memo(() => (
    <>
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-20 animate-scanlines"></div>
         <style>{`
            @keyframes scanlines {
                0% { background-position: 0 0; }
                100% { background-position: 0 50px; }
            }
            .animate-scanlines {
                background: linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(24, 24, 27, 0.5) 50%, rgba(24, 24, 27, 0.5) 100%);
                background-size: 100% 4px;
                animation: scanlines 0.5s linear infinite;
            }
        `}</style>
    </>
));
const RubyThemeDecorator: React.FC = React.memo(() => (
     <>
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(15)].map((_,i) => (
                <div key={i} className="absolute text-pink-400/50" style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    fontSize: `${0.5 + Math.random() * 1}rem`,
                    animationName: 'glint, drift',
                    animationDelay: `${Math.random() * 8}s`,
                    animationDuration: `${4 + Math.random() * 4}s, ${4 + Math.random() * 4}s`,
                    animationTimingFunction: 'ease-in-out, linear',
                    animationIterationCount: 'infinite, infinite',
                }}>✦</div>
            ))}
        </div>
         <style>{`
            @keyframes glint {
                0%, 100% { transform: scale(0.8); opacity: 0; }
                50% { transform: scale(1.5); opacity: 1; }
                75% { transform: scale(1.2); opacity: 0.8; }
            }
            @keyframes drift {
                from { transform: translateY(0); }
                to { transform: translateY(-80px); opacity: 0; }
            }
        `}</style>
    </>
));
const AutumnThemeDecorator: React.FC = React.memo(() => (
    <>
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(12)].map((_, i) => (
                <div key={i} className="absolute text-orange-400/50" style={{
                    top: '-10%',
                    left: `${-10 + Math.random() * 120}%`,
                    fontSize: `${1 + Math.random() * 1.5}rem`,
                    animationName: 'fall, sway',
                    animationDuration: `${7 + Math.random() * 8}s, ${4 + Math.random() * 5}s`,
                    animationDelay: `${Math.random() * 10}s, ${Math.random() * 5}s`,
                    animationTimingFunction: 'linear, ease-in-out',
                    animationIterationCount: 'infinite, infinite',
                    // @ts-ignore
                    '--sway-amount': `${(Math.random() - 0.5) * 150}px`,
                }}>
                    {Math.random() > 0.5 ? '🍁' : '🍂'}
                </div>
            ))}
        </div>
        <style>{`
            @keyframes fall {
                to {
                    transform: translateY(105vh) rotate(720deg);
                    opacity: 0;
                }
            }
            @keyframes sway {
                0%, 100% { margin-left: 0px; }
                50% { margin-left: var(--sway-amount); }
            }
        `}</style>
    </>
));


// --- Game Themes ---
export const DEFAULT_THEME: GameTheme = { id: 'theme_default', name: 'Default', boardBg: 'bg-slate-900', cellBg: 'bg-transparent', gridColor: 'border-slate-600', nameColor: 'text-white' };

export const THEMES: GameTheme[] = [
    { id: 'theme_ice', name: 'Ice', boardBg: 'bg-gradient-to-br from-[#0c1a3e] to-[#122a64]', cellBg: 'bg-transparent', gridColor: 'border-cyan-400/30', nameColor: 'text-cyan-100', decoratorComponent: IceThemeDecorator },
    { id: 'theme_retro', name: 'Retro', boardBg: 'bg-gradient-to-br from-[#281e36] to-[#4a2f58]', cellBg: 'bg-transparent', gridColor: 'border-yellow-400/30', nameColor: 'text-yellow-100', decoratorComponent: RetroThemeDecorator },
    { id: 'theme_ruby', name: 'Ruby', boardBg: 'bg-gradient-to-br from-[#3b0f2d] to-[#6d1b51]', cellBg: 'bg-transparent', gridColor: 'border-pink-400/30', nameColor: 'text-pink-100', decoratorComponent: RubyThemeDecorator },
    { id: 'theme_autumn', name: 'Autumn', boardBg: 'bg-gradient-to-br from-[#4a2525] to-[#7b3f3f]', cellBg: 'bg-transparent', gridColor: 'border-orange-400/30', nameColor: 'text-orange-100', decoratorComponent: AutumnThemeDecorator },
];

// --- Piece Styles ---
export const DEFAULT_PIECES_X: PieceStyle = { id: 'piece_default_x', name: 'Cross', component: Cross };
export const DEFAULT_PIECES_O: PieceStyle = { id: 'piece_default_o', name: 'Circle', component: Circle };

export const PIECE_STYLES: PieceStyle[] = [
    { id: 'piece_hexagon', name: 'Hexagon', component: Hexagon },
    { id: 'piece_triangle', name: 'Triangle', component: Triangle },
    { id: 'piece_plus', name: 'Plus', component: Plus },
    { id: 'piece_sun', name: 'Sun', component: Sun },
    { id: 'piece_paw', name: 'Paw Print', component: PawPrint },
    { id: 'piece_ghost', name: 'Ghost', component: Ghost },
    { id: 'piece_peace', name: 'Peace Sign', component: PeaceSign },
    { id: 'piece_diamond', name: 'Diamond', component: Diamond },
    { id: 'piece_star', name: 'Star', component: Star },
    { id: 'piece_heart', name: 'Heart', component: Heart },
    { id: 'piece_music', name: 'Music Note', component: MusicNote },
    { id: 'piece_bolt', name: 'Bolt', component: Bolt },
    { id: 'piece_planet', name: 'Planet', component: Planet },
    { id: 'piece_rocket', name: 'Rocket', component: Rocket },
    { id: 'piece_shield', name: 'Shield', component: Shield },
    { id: 'piece_square', name: 'Square', component: Square },
    { id: 'piece_moon', name: 'Moon', component: Moon },
    { id: 'piece_anchor', name: 'Anchor', component: Anchor },
    { id: 'piece_bug', name: 'Bug', component: Bug },
    { id: 'piece_crown', name: 'Crown', component: Crown },
    { id: 'piece_eye', name: 'Eye', component: Eye },
    { id: 'piece_fire', name: 'Fire', component: Fire },
    { id: 'piece_flag', name: 'Flag', component: Flag },
];

// --- Avatars ---
export const DEFAULT_AVATAR: Avatar = { id: 'avatar_default', name: 'Guest', component: Avatar1 };
export const AVATARS: Avatar[] = [
    { id: 'avatar_2', name: 'Rebel', component: Avatar2 },
    { id: 'avatar_3', name: 'Scholar', component: Avatar3 },
];

// --- Emojis ---
export const EMOJIS: Emoji[] = [
    { id: 'emoji_wave', name: 'Wave', emoji: '👋' },
    { id: 'emoji_cool', name: 'Cool', emoji: '😎' },
    { id: 'emoji_laugh', name: 'Laugh', emoji: '😂' },
    { id: 'emoji_wow', name: 'Wow', emoji: '😮' },
    { id: 'emoji_think', name: 'Thinking', emoji: '🤔' },
    { id: 'emoji_gg', name: 'Good Game', emoji: '🤝' },
];


// --- Piece Placement Effects ---
const EffectComponent: React.FC<{className?: string}> = ({className}) => ( <div className={className}><div /></div> );

// Previews
const DropPreview: React.FC = () => (<svg viewBox="0 0 100 100"><path d="M50 10 L50 70 M30 50 L50 70 L70 50" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/><circle cx="50" cy="80" r="10" fill="currentColor" /></svg>);
const RotatePreview: React.FC = () => (<svg viewBox="0 0 100 100"><path d="M 50,50 m -35,0 a 35,35 0 1,0 70,0 a 35,35 0 1,0 -70,0" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="150 220" strokeDashoffset="0"></path><path d="M80 50 L65 40 M80 50 L65 60" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" /></svg>);
const FlashPreview: React.FC = () => (<svg viewBox="0 0 100 100" className="text-yellow-300"><path d="M50 10 L55 45 L90 50 L55 55 L50 90 L45 55 L10 50 L45 45 Z" fill="currentColor" /></svg>);
const PhasePreview: React.FC = () => (<svg viewBox="0 0 100 100" className="text-purple-400"><circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="4" fill="none" /><circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="4 8" /></svg>);
const RipplePreview: React.FC = () => (<svg viewBox="0 0 100 100" className="text-cyan-400"><circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="4" fill="none"><animate attributeName="r" from="10" to="40" dur="1s" repeatCount="indefinite" begin="0s"/><animate attributeName="opacity" from="1" to="0" dur="1s" repeatCount="indefinite" begin="0s"/></circle></svg>);

const getEffectStyles = () => `
  /* Universal Glow for all effects */
  @keyframes piece-glow {
    0%, 100% { filter: drop-shadow(0 0 2px transparent); }
    50% { filter: drop-shadow(0 0 10px currentColor); }
  }

  /* Drop: Piece falls from above and lands with a bounce. */
  @keyframes piece-drop-fall {
    0% { transform: translateY(-200%); opacity: 0; }
    80% { transform: translateY(0); opacity: 1; }
    90% { transform: translateY(-10%); }
    100% { transform: translateY(0); }
  }
  .animate-effect_drop { animation: piece-drop-fall 0.4s cubic-bezier(0.5, 0, 0.25, 1.5) forwards, piece-glow 0.5s ease-out forwards; }

  /* Rotate: Spins 360 degrees. */
  @keyframes piece-rotate-spin {
    from { transform: rotate(-360deg) scale(0.5); opacity: 0; }
    to { transform: rotate(0deg) scale(1); opacity: 1; }
  }
  .animate-effect_rotate { animation: piece-rotate-spin 0.35s ease-out forwards, piece-glow 0.5s ease-out forwards; }

  /* Flash: An elegant, bright golden flash that bursts outwards */
  @keyframes piece-flash-burst {
    0% { transform: scale(0); opacity: 0.8; }
    100% { transform: scale(1.5); opacity: 0; }
  }
   @keyframes piece-flash-self {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); filter: brightness(2.5); }
  }
  .animate-effect_flash { animation: piece-flash-self 0.3s ease-in-out forwards; }
  .animate-effect_flash::after {
    content: '';
    position: absolute;
    inset: -20%;
    border-radius: 99px;
    background: radial-gradient(circle, currentColor 0%, transparent 70%);
    opacity: 0;
    transform: scale(0);
    animation: piece-flash-burst 0.35s ease-out forwards;
  }

  /* Phase: Holographic activation rings, no longer obscures piece */
  @keyframes piece-phase-fade-in {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes piece-phase-rings {
    from { transform: scale(0.5); opacity: 1; }
    to { transform: scale(1.5); opacity: 0; }
  }
  .animate-effect_phase { animation: piece-phase-fade-in 0.4s ease-out forwards; }
  .animate-effect_phase::before, .animate-effect_phase::after {
    content: '';
    position: absolute;
    inset: 0;
    border: 2px solid currentColor;
    border-radius: 99px;
    opacity: 0;
    transform: scale(0.5);
    animation: piece-phase-rings 0.45s ease-out forwards, piece-glow 0.5s ease-out forwards;
  }
  .animate-effect_phase::after { animation-delay: 0.1s; }

  /* Ripple: Expanding shockwave */
  @keyframes piece-ripple {
    from { transform: scale(0); opacity: 0.7; }
    to { transform: scale(3); opacity: 0; }
  }
  .animate-effect_ripple { animation: piece-glow 0.5s ease-out forwards; }
  .animate-effect_ripple::before {
    content: ''; position: absolute; inset: 0; border-radius: 99px;
    border: 3px solid currentColor;
    animation: piece-ripple 0.4s ease-out forwards;
  }
`;

export const EffectStyles: React.FC = () => (<style>{getEffectStyles()}</style>);


export const DEFAULT_EFFECT: PieceEffect = { id: 'effect_flash', name: 'Flash', component: EffectComponent, previewComponent: FlashPreview };

export const PIECE_EFFECTS: PieceEffect[] = [
    { id: 'effect_rotate', name: 'Rotate', component: EffectComponent, previewComponent: RotatePreview },
    { id: 'effect_drop', name: 'Drop', component: EffectComponent, previewComponent: DropPreview },
    { id: 'effect_phase', name: 'Phase', component: EffectComponent, previewComponent: PhasePreview },
    { id: 'effect_ripple', name: 'Ripple', component: EffectComponent, previewComponent: RipplePreview },
];


// --- All Cosmetics ---
export const ALL_COSMETICS: Cosmetic[] = [
    ...PIECE_STYLES.map((p, i) => ({ id: p.id, name: p.name, type: 'piece' as const, price: i < 7 ? 300 : 400, item: p })),
    ...AVATARS.map(a => ({ id: a.id, name: a.name, type: 'avatar' as const, price: 500, item: a})),
    ...EMOJIS.slice(0, 4).map(e => ({ id: e.id, name: e.name, type: 'emoji' as const, price: 100, item: e })),
    ...THEMES.map(t => ({ id: t.id, name: t.name, type: 'theme' as const, price: 1000, item: t })),
    ...PIECE_EFFECTS.map(e => ({ id: e.id, name: e.name, type: 'effect' as const, price: 750, item: e })),
];

// --- Bot Profiles ---
export const BOTS: BotProfile[] = [
    {
        id: 'bot_rookie',
        name: 'Easy AI',
        avatar: 'https://i.pravatar.cc/150?u=easy_ai',
        level: 2,
        skillLevel: 'easy',
        description: 'A friendly bot just learning the ropes. A great first challenge.'
    },
    {
        id: 'bot_master',
        name: 'Medium AI',
        avatar: 'https://i.pravatar.cc/150?u=medium_ai',
        level: 5,
        skillLevel: 'medium',
        description: 'A seasoned player. Thinks a few moves ahead. Can you outsmart it?'
    },
    {
        id: 'bot_grandmaster',
        name: 'Hard AI',
        avatar: 'https://i.pravatar.cc/150?u=hard_ai',
        level: 10,
        skillLevel: 'hard',
        description: 'An expert strategist. Makes very few mistakes. A true test of skill.'
    }
];
