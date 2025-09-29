
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { getAIMove } from '../services/aiService';
import { updateOpeningBook } from '../services/openingBook';
import type { Player, BoardState, GameTheme, PieceStyle, BotProfile, Avatar, Emoji, PieceEffect } from '../types';
import Modal from './Modal';
import { COIN_REWARD, XP_REWARD, TURN_TIME, getXpForNextLevel, EMOJIS, PIECE_STYLES, EffectStyles, DEFAULT_EFFECT } from '../constants';
import Shop from './Shop';
import Inventory from './Inventory';
import { useGameState } from '../context/GameStateContext';

// --- Helper Hooks and Functions ---
const useAnimatedCounter = (endValue: number, start: boolean, duration = 1200) => {
    const [count, setCount] = useState(0);
    const frameRef = React.useRef<number | null>(null);

    useEffect(() => {
        if (start) {
            let startTimestamp: number | null = null;
            const step = (timestamp: number) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                setCount(Math.floor(progress * endValue));
                if (progress < 1) {
                    frameRef.current = requestAnimationFrame(step);
                }
            };
            frameRef.current = requestAnimationFrame(step);
        } else {
             setCount(0);
        }
        return () => {
             if(frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [endValue, duration, start]);
    return count;
};

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// --- GameCell Component ---
interface GameCellProps {
  state: Player | null;
  onClick: () => void;
  isWinningCell: boolean;
  pieces: { X: PieceStyle, O: PieceStyle };
  showThinkingIndicator: boolean;
  theme: GameTheme;
  playPlacementEffect: boolean;
  isLastMove: boolean;
  effect: PieceEffect;
}

const GameCell: React.FC<GameCellProps> = React.memo(({ state, onClick, isWinningCell, pieces, showThinkingIndicator, theme, playPlacementEffect, isLastMove, effect }) => {
  const PieceX = pieces.X.component;
  const PieceO = pieces.O.component;
  const effectIdClass = `animate-effect_${effect.id.split('_')[1]}`;

  return (
    <div
      className={`w-full h-full flex items-center justify-center cursor-pointer group relative`}
      onClick={onClick}
      style={{'--tw-bg-opacity': 0.1} as React.CSSProperties}
    >
        <div className={`absolute inset-0 border-r border-b ${theme.gridColor}`}></div>
        {state === null && <div className={`absolute inset-0 opacity-0 group-hover:bg-white/10 transition-colors duration-200 rounded-sm`}></div>}
      
      <div className={`w-full h-full relative transition-all duration-200 ${isWinningCell ? 'bg-yellow-500/30 rounded-md scale-110' : ''}`}>
        {state && (
           <div className={`w-full h-full p-1.5`}>
            <div className={`relative w-full h-full ${state === 'X' ? 'text-cyan-400' : 'text-pink-500'}`}>
                <div className={`${playPlacementEffect ? effectIdClass : ''} ${isLastMove ? 'last-move-highlight' : ''}`}>
                    {state === 'X' ? <PieceX /> : <PieceO />}
                </div>
            </div>
          </div>
        )}
        {showThinkingIndicator && (
             <div className="w-full h-full flex items-center justify-center">
                 <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
             </div>
        )}
      </div>
    </div>
  );
});

// --- GameBoard Component ---
interface GameBoardProps {
  board: BoardState;
  onCellClick: (row: number, col: number) => void;
  winningLine: { row: number; col: number }[];
  pieces: { X: PieceStyle, O: PieceStyle };
  aiThinkingCell: {row: number, col: number} | null;
  theme: GameTheme;
  lastMove: {row: number, col: number} | null;
  effect: PieceEffect;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick, winningLine, pieces, aiThinkingCell, theme, lastMove, effect }) => {
  const isWinningCell = (row: number, col: number) => winningLine.some(cell => cell.row === row && cell.col === col);
  
  return (
    <div className={`p-1.5 sm:p-2 rounded-lg bg-slate-900/50`}>
      <div 
        className={`grid ${theme.cellBg} border-t border-l ${theme.gridColor}`}
        style={{ gridTemplateColumns: `repeat(${board.length}, minmax(0, 1fr))`}}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div key={`${rowIndex}-${colIndex}`} className="aspect-square">
                <GameCell
                  state={cell}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  isWinningCell={isWinningCell(rowIndex, colIndex)}
                  pieces={pieces}
                  showThinkingIndicator={aiThinkingCell?.row === rowIndex && aiThinkingCell?.col === colIndex}
                  theme={theme}
                  playPlacementEffect={lastMove?.row === rowIndex && lastMove?.col === colIndex}
                  isLastMove={lastMove?.row === rowIndex && lastMove?.col === colIndex}
                  effect={effect}
                />
            </div>
          ))
        )}
      </div>
    </div>
  );
};


// --- PlayerInfo Component ---
interface PlayerInfoProps {
    name: string;
    avatar: string | React.FC<{className?: string}>;
    level: number;
    player: Player;
    align: 'left' | 'right';
    isCurrent: boolean;
    piece: PieceStyle;
}
const PlayerInfo: React.FC<PlayerInfoProps> = ({ name, avatar, level, player, align, isCurrent, piece }) => {
    const AvatarComponent = typeof avatar === 'function' ? avatar : null;
    const PieceComponent = piece.component;
    const glowClass = isCurrent ? 'shadow-lg shadow-yellow-500/50' : '';
    const colorClass = player === 'X' ? 'text-cyan-400' : 'text-pink-500';

    return (
        <div className={`flex items-center gap-3 relative ${align === 'right' ? 'flex-row-reverse' : ''}`}>
             {AvatarComponent 
                ? <AvatarComponent className={`w-14 h-14 transition-all duration-300 ${glowClass}`} /> 
                : <img src={avatar as string} alt={name} className={`w-14 h-14 rounded-full transition-all duration-300 ${glowClass}`} />
             }
            <div className={`${align === 'right' ? 'text-right' : ''}`}>
                <h3 className="font-bold text-white text-md">{name}</h3>
                <div className={`flex items-center gap-2 mt-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
                    <p className="text-slate-400 text-sm">Lv. {level}</p>
                    <div className={`w-5 h-5 ${colorClass}`}><PieceComponent /></div>
                </div>
            </div>
        </div>
    )
}

// --- GameOver Modal Content ---
const GameOverScreen: React.FC<{show: boolean, winner: Player | 'draw' | 'timeout' | null, timedOutPlayer: Player | null, playerMark: Player, onReset: () => void, onExit: () => void, playerLevel: number, playerXp: number }> = ({show, winner, timedOutPlayer, playerMark, onReset, onExit, playerLevel, playerXp}) => {
    const [leaveCountdown, setLeaveCountdown] = useState(5);
    const [animationStage, setAnimationStage] = useState<'start' | 'filling' | 'levelUp' | 'done'>('start');
    const [displayLevel, setDisplayLevel] = useState(playerLevel);

    const isWin = winner === playerMark;
    const isDraw = winner === 'draw';
    const didPlayerTimeout = timedOutPlayer === playerMark;
    
    const outcome = didPlayerTimeout ? 'loss' : isWin ? 'win' : isDraw ? 'draw' : 'loss';
    const xpEarned = show ? XP_REWARD[outcome] : 0;
    const coinsEarned = show ? COIN_REWARD[outcome] : 0;
    
    // Calculate level up logic for display
    let newLevel = playerLevel;
    let finalXp = playerXp + xpEarned;
    let xpForNext = getXpForNextLevel(newLevel);
    let didLevelUp = false;
    
    if (show && finalXp >= xpForNext) {
        didLevelUp = true;
        while(finalXp >= xpForNext) {
            finalXp -= xpForNext;
            newLevel++;
            xpForNext = getXpForNextLevel(newLevel);
        }
    }

    const initialXpPercent = (playerXp / getXpForNextLevel(playerLevel)) * 100;
    const finalXpPercent = didLevelUp ? 100 : ((playerXp + xpEarned) / getXpForNextLevel(playerLevel)) * 100;
    const newLevelXpPercent = (finalXp / getXpForNextLevel(newLevel)) * 100;
    
    const animatedCoins = useAnimatedCounter(coinsEarned, animationStage !== 'start');
    const animatedXp = useAnimatedCounter(xpEarned, animationStage !== 'start');
    
    const getTitle = () => {
        if (winner === 'timeout') return didPlayerTimeout ? "TIME'S UP!" : "OPPONENT TIMED OUT";
        if (isWin) return "YOU WIN!";
        if (isDraw) return "IT'S A DRAW!";
        return "YOU LOSE!";
    }

    const title = getTitle();
    const titleColor = outcome === 'win' ? "text-green-400" : outcome === 'draw' ? "text-yellow-400" : "text-red-500";
    
    useEffect(() => {
        let countdownInterval: ReturnType<typeof setInterval> | null = null;
        let animationTimer: ReturnType<typeof setTimeout> | null = null;
        if (show) {
            countdownInterval = setInterval(() => {
                setLeaveCountdown(prev => {
                    if (prev <= 1) {
                        if(countdownInterval) clearInterval(countdownInterval);
                        onExit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            animationTimer = setTimeout(() => {
              setAnimationStage('filling');
              if (didLevelUp) {
                setTimeout(() => setAnimationStage('levelUp'), 1200);
                setTimeout(() => {
                  setDisplayLevel(newLevel);
                  setAnimationStage('done');
                }, 1700);
              } else {
                setTimeout(() => setAnimationStage('done'), 1200);
              }
            }, 500);

            return () => {
                if(countdownInterval) clearInterval(countdownInterval);
                if(animationTimer) clearTimeout(animationTimer);
            };
        } else {
            setAnimationStage('start');
            setDisplayLevel(playerLevel);
            setLeaveCountdown(5);
        }
    }, [show, onExit, didLevelUp, newLevel, playerLevel]);


    return (
        <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-40 transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`text-center transition-all duration-500 ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
                <h1 className={`text-7xl font-black ${titleColor} mb-8`}>{title}</h1>
                
                <div className="bg-slate-800 rounded-xl p-6 w-80 mx-auto border border-slate-700 relative">
                     {animationStage === 'levelUp' && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-3xl font-bold text-yellow-300 animate-bounce">LEVEL UP!</div>
                    )}
                    <div className="text-left mb-4">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="font-semibold text-white">Level {displayLevel}</span>
                             <span className={`text-sm bg-pink-500 text-white font-bold px-2 py-0.5 rounded-full transition-transform duration-300 ${animationStage === 'levelUp' ? 'scale-150' : ''}`}>{displayLevel}</span>
                        </div>
                        <div className="bg-slate-700 h-4 rounded-full overflow-hidden relative">
                             <div 
                                className="bg-pink-500 h-full absolute transition-all duration-1000 ease-out" 
                                style={{
                                    width: animationStage === 'start' ? `${initialXpPercent}%` 
                                         : animationStage === 'filling' ? `${finalXpPercent}%`
                                         : animationStage === 'levelUp' ? '100%'
                                         : `${newLevelXpPercent}%`,
                                    transitionDuration: animationStage === 'done' && didLevelUp ? '0s' : '1s',
                                }}
                            ></div>
                        </div>
                        <p className="text-right text-sm text-slate-400 mt-1">
                            {animationStage === 'done' && didLevelUp ? finalXp : playerXp + animatedXp}
                            /
                            {getXpForNextLevel(displayLevel)} XP
                        </p>
                    </div>

                    <h2 className="font-bold text-slate-300 mb-2">REWARDS</h2>
                     <div className="bg-slate-900/50 rounded-lg p-3 flex justify-around">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl">💰</span>
                            <span className={`font-bold text-yellow-400 text-xl transition-opacity duration-500 ${animationStage !== 'start' ? 'opacity-100' : 'opacity-0'}`}>+{animatedCoins}</span>
                        </div>
                         <div className="flex flex-col items-center">
                            <span className="text-2xl">✨</span>
                            <span className={`font-bold text-purple-400 text-xl transition-opacity duration-500 ${animationStage !== 'start' ? 'opacity-100' : 'opacity-0'}`}>+{animatedXp} XP</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <button onClick={() => onReset()} className="w-full max-w-sm bg-green-500 hover:bg-green-400 text-black font-bold py-3 px-6 rounded-lg transition-colors text-lg">
                        Play again!
                    </button>
                    <button onClick={() => onExit()} className="w-full max-w-sm bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        Leave room ({leaveCountdown})
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- First Move Animation ---
const FirstMoveAnimation: React.FC<{pieces: {X: PieceStyle, O: PieceStyle}, onAnimationEnd: (firstPlayer: Player) => void, playerMark: Player}> = ({pieces, onAnimationEnd, playerMark}) => {
    const [winner, setWinner] = useState<Player | null>(null);
    const firstPlayer = useMemo(() => Math.random() < 0.5 ? 'X' : 'O', []);
    const PieceX = pieces.X.component;
    const PieceO = pieces.O.component;

    useEffect(() => {
        const timer = setTimeout(() => {
            setWinner(firstPlayer);
            setTimeout(() => onAnimationEnd(firstPlayer), 1500);
        }, 1500);
        return () => clearTimeout(timer);
    }, [firstPlayer, onAnimationEnd]);
    
    return (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg z-20">
            <div className="relative w-48 h-24">
                <div className={`absolute top-0 w-24 h-24 p-2 transition-all duration-500 ease-out ${winner ? (winner === 'X' ? 'left-1/2 -translate-x-1/2 scale-125' : 'left-0 opacity-0 -translate-x-full') : 'left-0 animate-slide-in-left'}`}><PieceX className="text-cyan-400"/></div>
                <div className={`absolute top-0 w-24 h-24 p-2 transition-all duration-500 ease-out ${winner ? (winner === 'O' ? 'left-1/2 -translate-x-1/2 scale-125' : 'right-0 opacity-0 translate-x-full') : 'right-0 animate-slide-in-right'}`}><PieceO className="text-pink-500"/></div>
            </div>
            <p className="text-white font-semibold text-lg mt-4 transition-opacity duration-300">{winner ? `${winner === playerMark ? 'You go' : 'AI goes'} first!` : 'Deciding who goes first...'}</p>
            <style>{`
                @keyframes slide-in-left { 0% { transform: translateX(-100vw); } 80% { transform: translateX(0); } 100% { transform: translateX(0); }}
                @keyframes slide-in-right { 0% { transform: translateX(100vw); } 80% { transform: translateX(0); } 100% { transform: translateX(0); }}
                .animate-slide-in-left { animation: slide-in-left 1s cubic-bezier(0.25, 1, 0.5, 1); }
                .animate-slide-in-right { animation: slide-in-right 1s cubic-bezier(0.25, 1, 0.5, 1); }
            `}</style>
        </div>
    )
}

// --- Smooth Timer Bar ---
const SmoothTimerBar: React.FC<{ currentPlayer: Player | null; isPaused: boolean; isGameOver: boolean, isDecidingFirst: boolean }> = React.memo(({ currentPlayer, isPaused, isGameOver, isDecidingFirst }) => {
    const [visualTime, setVisualTime] = useState(TURN_TIME);
    const animationFrameRef = useRef<number>();
    const turnStartTimeRef = useRef<number>(0);
    const pauseTimeRef = useRef<number>(0);
    const lastPlayerRef = useRef<Player|null>(null);

    useEffect(() => {
        // Reset timer only when the player actually changes, or game state demands it.
        if (currentPlayer !== lastPlayerRef.current || isDecidingFirst) {
            turnStartTimeRef.current = Date.now();
            pauseTimeRef.current = 0;
            setVisualTime(TURN_TIME);
            lastPlayerRef.current = currentPlayer;
        }
    }, [currentPlayer, isDecidingFirst]);
    
    useEffect(() => {
        if (isPaused && pauseTimeRef.current === 0) {
            pauseTimeRef.current = Date.now();
        } else if (!isPaused && pauseTimeRef.current > 0) {
            const pauseDuration = Date.now() - pauseTimeRef.current;
            turnStartTimeRef.current += pauseDuration;
            pauseTimeRef.current = 0;
        }
    }, [isPaused]);

    useEffect(() => {
        const animate = () => {
            if (!isPaused && !isGameOver && !isDecidingFirst && currentPlayer) {
                const elapsed = Date.now() - turnStartTimeRef.current;
                const remaining = Math.max(0, TURN_TIME - elapsed / 1000);
                setVisualTime(remaining);
            }
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [currentPlayer, isPaused, isGameOver, isDecidingFirst]);

    const shouldAnimate = !isGameOver && !isDecidingFirst && !isPaused && currentPlayer;
    const percentage = (visualTime / TURN_TIME) * 100;
    const timeBarColor = percentage < 30 ? 'bg-red-500' : percentage < 70 ? 'bg-yellow-400' : 'bg-green-400';
    
    return (
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
                className={`h-full ${timeBarColor} rounded-full`} 
                style={{
                    width: `${percentage}%`,
                    transition: shouldAnimate ? 'none' : 'width 0.3s ease-in-out'
                }}>
            </div>
        </div>
    );
});


// --- GameScreen Main Component ---
interface GameScreenProps {
  bot: BotProfile;
  onExit: () => void;
  onGameEnd: (result: 'win' | 'loss' | 'draw') => void;
  theme: GameTheme;
  pieces: { X: PieceStyle, O: PieceStyle };
  playerInfo: { name: string, level: number, avatar: Avatar, xp: number, wins: number, losses: number };
  activeEffect: PieceEffect;
  isPaused: boolean;
  onOpenShop: () => void;
  onOpenInventory: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ bot, onExit, onGameEnd, theme, pieces, playerInfo, activeEffect, isPaused, onOpenShop, onOpenInventory }) => {
    const playerMark: Player = 'X';
    const aiMark: Player = 'O';

    const { board, currentPlayer, winner, isGameOver, makeMove, startGame, beginGame, winningLine, isDecidingFirst, totalGameTime, resign, undoMove, canUndo, moveHistory } = useGameLogic(playerMark, isPaused);
    const { gameState, toggleSound, toggleMusic } = useGameState();

    const [aiThinkingCell, setAiThinkingCell] = useState<{row: number, col: number} | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isEmojiPanelOpen, setEmojiPanelOpen] = useState(false);
    const [lastMove, setLastMove] = useState<{row: number, col: number} | null>(null);
    const [aiPiece, setAiPiece] = useState<PieceStyle>(PIECE_STYLES[0]);

    const [playerEmoji, setPlayerEmoji] = useState<string | null>(null);
    const [aiEmoji, setAiEmoji] = useState<string | null>(null);
    
    const isAiThinkingRef = useRef(false);
    const ownedEmojis = useMemo(() => EMOJIS.filter(e => gameState.ownedCosmeticIds.includes(e.id)), [gameState.ownedCosmeticIds]);

    useEffect(() => {
        const randomPiece = PIECE_STYLES[Math.floor(Math.random() * PIECE_STYLES.length)];
        setAiPiece(randomPiece);
    }, []);

    const showEmoji = (emoji: string, isPlayer: boolean) => {
        if (isPlayer) {
            setPlayerEmoji(emoji);
            setTimeout(() => setPlayerEmoji(null), 3200); // Match animation duration
        } else {
            setAiEmoji(emoji);
            setTimeout(() => setAiEmoji(null), 3200); // Match animation duration
        }
    };
    
    useEffect(() => {
        if (!isDecidingFirst && bot && currentPlayer === aiMark && !isGameOver && !isAiThinkingRef.current) {
            isAiThinkingRef.current = true;
            if (Math.random() < 0.15) {
                setTimeout(() => showEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)].emoji, false), 500);
            }

            const onThinking = (move: { row: number, col: number }) => {
                setAiThinkingCell(move);
            };

            getAIMove(board, aiMark, bot.skillLevel, onThinking).then(({ row, col }) => {
                if (row !== -1 && !isGameOver) { // Ensure game hasn't ended while AI was "thinking"
                    setAiThinkingCell(null); // Clear indicator before making the move
                    makeMove(row, col);
                    setLastMove({row, col});
                }
            }).catch((err) => {
                console.error("AI failed to make a move:", err);
                setAiThinkingCell(null);
            }).finally(() => {
                isAiThinkingRef.current = false;
            });
        }
    }, [currentPlayer, isGameOver, makeMove, bot, aiMark, isDecidingFirst, board]);

    useEffect(() => {
        if (isGameOver && winner) {
            const timedOutPlayer = winner === 'timeout' ? currentPlayer : null;
            const result = timedOutPlayer === playerMark ? 'loss' : winner === playerMark ? 'win' : winner === 'draw' ? 'draw' : 'loss';
            onGameEnd(result);

            // If AI won, update the opening book with this game's moves.
            if (winner === aiMark) {
                updateOpeningBook(moveHistory);
            }
        }
    }, [isGameOver, winner, onGameEnd, playerMark, currentPlayer, aiMark, moveHistory]);

    const handleCellClick = (row: number, col: number) => {
        if (currentPlayer === playerMark && !isDecidingFirst) {
            makeMove(row, col);
            setLastMove({row, col});
        }
    };
    
    const allPieces = { X: pieces.X, O: aiPiece };
    const DecoratorComponent = theme.decoratorComponent;

    return (
    <div className={`${theme.boardBg} min-h-screen p-2 sm:p-4 flex flex-col items-center justify-center font-sans transition-colors duration-500 relative overflow-hidden`}>
        {DecoratorComponent && <DecoratorComponent />}
        <EffectStyles />

        <div className="w-full max-w-xl mx-auto relative z-10 flex flex-col h-full justify-center">
            <header className="flex justify-center items-center w-full">
                <div className="text-center">
                    <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400" style={{ textShadow: '0 2px 10px rgba(100, 200, 255, 0.3)' }}>
                        Caro AI Arena
                    </h1>
                     <div className="relative">
                        <div className="flex items-center justify-center gap-4 mt-1">
                            <button onClick={() => setIsSettingsOpen(true)} className="bg-slate-800/80 p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Settings"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                            <button onClick={undoMove} disabled={!canUndo} className="bg-slate-800/80 p-2 rounded-full hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Undo"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 000-10H9"></path></svg></button>
                            <button onClick={() => setEmojiPanelOpen(p => !p)} className="bg-slate-800/80 p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Emotes"><svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                        </div>
                        {isEmojiPanelOpen && (
                            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 p-2 rounded-full flex gap-2 animate-fade-in-down w-max z-20">
                               {ownedEmojis.map(e => <button key={e.id} onClick={() => { showEmoji(e.emoji, true); setEmojiPanelOpen(false);}} className="text-3xl hover:scale-125 transition-transform">{e.emoji}</button>)}
                            </div>
                        )}
                    </div>
                </div>
            </header>
            
            <main className="flex-grow flex flex-col justify-center relative">
                 {playerEmoji && <div className="absolute left-16 top-0 text-5xl animate-emote-fall z-30">{playerEmoji}</div>}
                 {aiEmoji && <div className="absolute right-16 top-0 text-5xl animate-emote-fall z-30">{aiEmoji}</div>}
                 <div className="flex justify-between items-end px-2 mb-[4px] -mt-px">
                    <PlayerInfo name={playerInfo.name} avatar={playerInfo.avatar.component} level={playerInfo.level} align="left" player="X" isCurrent={currentPlayer === playerMark} piece={pieces.X} />
                     <div className="text-center pb-1">
                        <div className="text-white font-mono text-sm tracking-wider">
                            <span className="text-green-400">{playerInfo.wins}W</span>
                             - 
                            <span className="text-red-400">{playerInfo.losses}L</span>
                        </div>
                        <div className="text-white font-mono text-lg tracking-wider">{formatTime(totalGameTime)}</div>
                    </div>
                    <PlayerInfo name={bot.name} avatar={bot.avatar} level={bot.level} align="right" player="O" isCurrent={currentPlayer === aiMark} piece={aiPiece} />
                </div>
                <div className="w-[90%] mx-auto">
                    <SmoothTimerBar 
                        currentPlayer={currentPlayer} 
                        isPaused={isPaused}
                        isGameOver={isGameOver}
                        isDecidingFirst={isDecidingFirst}
                    />
                    <div className="mt-px relative">
                        <GameBoard board={board} onCellClick={handleCellClick} winningLine={winningLine} pieces={allPieces} aiThinkingCell={aiThinkingCell} theme={theme} lastMove={lastMove} effect={activeEffect} />
                        {isDecidingFirst && <FirstMoveAnimation pieces={allPieces} onAnimationEnd={beginGame} playerMark={playerMark} />}
                        {isGameOver && winner && winner !== 'draw' && winner !== 'timeout' && (
                            <div className="absolute inset-0 pointer-events-none z-10">
                                {Array(30).fill(0).map((_, i) => (
                                    <div key={i} className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-particle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
        
        {/* FIX: The `startGame` function was being passed directly to `onReset` in some cases,
            which is problematic because button `onClick` handlers pass an event object that
            `startGame` does not expect. Wrapping the call in an arrow function `() => startGame()` 
            ensures it's always called without arguments, resolving the error. */}
        <GameOverScreen show={isGameOver} winner={winner} timedOutPlayer={winner === 'timeout' ? currentPlayer : null} playerMark={playerMark} onReset={() => startGame()} onExit={onExit} playerLevel={playerInfo.level} playerXp={playerInfo.xp} />

        <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Settings">
             <div className="space-y-4 text-white">
                <div className="rounded-lg overflow-hidden border border-slate-700 divide-y divide-slate-700">
                     <button
                        onClick={toggleSound}
                        className="w-full flex justify-between items-center px-4 py-3 hover:bg-slate-700/50 transition-colors"
                    >
                        <span className="font-semibold">Sound</span>
                        <span className={`font-bold ${gameState.isSoundOn ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {gameState.isSoundOn ? 'ON' : 'OFF'}
                        </span>
                    </button>
                    <button
                        onClick={toggleMusic}
                        className="w-full flex justify-between items-center px-4 py-3 hover:bg-slate-700/50 transition-colors"
                    >
                        <span className="font-semibold">Music</span>
                        <span className={`font-bold ${gameState.isMusicOn ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {gameState.isMusicOn ? 'ON' : 'OFF'}
                        </span>
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => { onOpenShop(); setIsSettingsOpen(false); }} className="w-full bg-purple-600 hover:bg-purple-500 font-bold py-3 rounded-lg transition-colors">Shop</button>
                    <button onClick={() => { onOpenInventory(); setIsSettingsOpen(false); }} className="w-full bg-indigo-600 hover:bg-indigo-500 font-bold py-3 rounded-lg transition-colors">Inventory</button>
                </div>
                <button onClick={() => { resign(); setIsSettingsOpen(false); }} className="w-full bg-red-600 hover:bg-red-500 font-bold py-3 rounded-lg transition-colors">Resign Game</button>
                <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-slate-600 hover:bg-slate-500 font-bold py-3 rounded-lg transition-colors">Close</button>
            </div>
        </Modal>

        <style>{`
            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .animate-spin-slow { animation: spin-slow 10s linear infinite; }
            @keyframes particle {
                0% { transform: scale(1) translateY(0); opacity: 1; }
                100% { transform: scale(0) translateY(-100px); opacity: 0; }
            }
            .animate-particle { animation: particle 2s ease-out forwards; }
             @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up { animation: fade-in-up 0.2s ease-out forwards; }
            @keyframes fade-in-down {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-down { animation: fade-in-down 0.2s ease-out forwards; }
            @keyframes emote-fall-and-sway {
                0% {
                    transform: translateY(-20px) translateX(0px) scale(0.8) rotate(-5deg);
                    opacity: 0;
                }
                20% {
                    transform: translateY(0px) translateX(-10px) scale(1.2) rotate(5deg);
                    opacity: 1;
                }
                50% {
                    transform: translateY(25vh) translateX(10px) scale(0.9) rotate(-8deg);
                    opacity: 1;
                }
                80% {
                    transform: translateY(50vh) translateX(-5px) scale(0.6) rotate(3deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(65vh) translateX(0px) scale(0.4) rotate(10deg);
                    opacity: 0;
                }
            }
            .animate-emote-fall {
                animation: emote-fall-and-sway 3.2s ease-out forwards;
            }
            @keyframes last-move-glow {
                0%, 100% {
                    filter: drop-shadow(0 0 4px rgba(255, 255, 100, 0.6));
                }
                50% {
                    filter: drop-shadow(0 0 10px rgba(255, 255, 100, 0.9));
                }
            }
            .last-move-highlight {
                animation: last-move-glow 1.5s ease-in-out infinite;
            }
        `}</style>
    </div>
  );
};

export default GameScreen;
