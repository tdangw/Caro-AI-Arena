import React, { useState, useCallback, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import Shop from './components/Shop';
import Inventory from './components/Inventory';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import type { BotProfile } from './types';
import { useSound } from './hooks/useSound';

type View = 'menu' | 'game' | 'shop' | 'inventory';
type Overlay = 'shop' | 'inventory' | null;

const ACTIVE_GAME_BOT_KEY = 'caroActiveGame_bot';

const SplashScreen: React.FC<{ onEnter: () => void }> = ({ onEnter }) => (
    <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%231e293b%22%20fill-opacity%3D%220.4%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
        <div className="relative z-10 animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-2">
                Caro <span className="text-cyan-400">AI Arena</span>
            </h1>
            <p className="text-slate-400 text-xl mb-12">Five in a row. Infinite possibilities.</p>
            <button
                onClick={onEnter}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-4 px-10 rounded-lg text-2xl transition-all duration-300 transform hover:scale-110 shadow-lg shadow-cyan-500/20"
            >
                Enter Arena
            </button>
        </div>
         <style>{`
            @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        `}</style>
    </div>
);

const AppContent: React.FC = () => {
    const [isReady, setIsReady] = useState(false);
    const [isHidingSplash, setIsHidingSplash] = useState(false);
    const [view, setView] = useState<View>(() => {
        return localStorage.getItem(ACTIVE_GAME_BOT_KEY) ? 'game' : 'menu';
    });
    const [activeBot, setActiveBot] = useState<BotProfile | null>(() => {
        try {
            const savedBot = localStorage.getItem(ACTIVE_GAME_BOT_KEY);
            return savedBot ? JSON.parse(savedBot) : null;
        } catch {
            localStorage.removeItem(ACTIVE_GAME_BOT_KEY);
            return null;
        }
    });
    const [overlay, setOverlay] = useState<Overlay>(null);
    const { gameState } = useGameState();
    const { playSound, playMusic, stopMusic } = useSound();

    useEffect(() => {
        if (isReady) {
            if (view === 'menu' || view === 'game') {
                playMusic();
            } else {
                stopMusic();
            }
        }
    }, [view, playMusic, stopMusic, isReady]);

    const handleStartGame = useCallback((bot: BotProfile) => {
        try {
            playSound('select');
            localStorage.setItem(ACTIVE_GAME_BOT_KEY, JSON.stringify(bot));
            setActiveBot(bot);
            setView('game');
        } catch (error) {
            console.error("Failed to save active bot:", error);
        }
    }, [playSound]);

    const handleGoToShop = useCallback(() => {
        playSound('select');
        setView('shop');
    }, [playSound]);
    const handleGoToInventory = useCallback(() => {
        playSound('select');
        setView('inventory');
    }, [playSound]);
    
    const handleBackToMenu = useCallback(() => {
        playSound('select');
        setView('menu');
        setActiveBot(null);
        setOverlay(null);
        localStorage.removeItem(ACTIVE_GAME_BOT_KEY);
        localStorage.removeItem('caroGameState_inProgress'); 
    }, [playSound]);

    const handleOpenShopOverlay = () => {
        playSound('select');
        setOverlay('shop');
    }
    const handleOpenInventoryOverlay = () => {
        playSound('select');
        setOverlay('inventory');
    }
    const handleCloseOverlay = () => {
        playSound('select');
        setOverlay(null);
    }
    
    const handleGameEnd = useCallback(() => {
        // The game result is now applied within GameScreen as soon as the game ends.
        // This function is only responsible for navigating back to the main menu.
        handleBackToMenu();
    }, [handleBackToMenu]);
    
    const handleEnter = () => {
        playSound('select');
        setIsHidingSplash(true);
        setTimeout(() => {
            setIsReady(true);
        }, 800); // Must be > transition duration
    };

    if (!isReady) {
        return (
            <div className={`transition-all duration-700 ease-in-out ${isHidingSplash ? 'opacity-0 scale-90 blur-sm' : 'opacity-100'}`}>
                <SplashScreen onEnter={handleEnter} />
            </div>
        );
    }


    const renderView = () => {
        switch (view) {
            case 'game':
                if (!activeBot) {
                    // This case handles if local storage is corrupted or game ends unexpectedly
                    handleBackToMenu();
                    return <MainMenu 
                            onStartGame={handleStartGame}
                            onGoToShop={handleGoToShop} 
                            onGoToInventory={handleGoToInventory}
                        />;
                }
                return <GameScreen 
                            bot={activeBot} 
                            onExit={handleGameEnd} 
                            theme={gameState.activeTheme} 
                            pieces={{ X: gameState.activePieceX, O: gameState.activePieceO }}
                            playerInfo={{name: gameState.playerName, level: gameState.playerLevel, avatar: gameState.activeAvatar, xp: gameState.playerXp, wins: gameState.wins, losses: gameState.losses}}
                            activeEffect={gameState.activeEffect}
                            activeVictoryEffect={gameState.activeVictoryEffect}
                            activeBoomEffect={gameState.activeBoomEffect}
                            isPaused={!!overlay}
                            onOpenShop={handleOpenShopOverlay}
                            onOpenInventory={handleOpenInventoryOverlay}
                        />;
            case 'shop':
                return <Shop onBack={handleBackToMenu} />;
            case 'inventory':
                return <Inventory onBack={handleBackToMenu} />;
            case 'menu':
            default:
                return <MainMenu 
                            onStartGame={handleStartGame}
                            onGoToShop={handleGoToShop} 
                            onGoToInventory={handleGoToInventory}
                        />;
        }
    };

    return (
        <div className="bg-slate-900 relative animate-app-fade-in">
            {renderView()}
            {overlay && (
                <div className="fixed inset-0 z-50 bg-black/70 p-4 sm:p-8 overflow-y-auto">
                    {overlay === 'shop' && <Shop onBack={handleCloseOverlay} />}
                    {overlay === 'inventory' && <Inventory onBack={handleCloseOverlay} />}
                </div>
            )}
            <style>{`
                @keyframes app-fade-in {
                    from { opacity: 0; transform: scale(0.97); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-app-fade-in { animation: app-fade-in 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
            `}</style>
        </div>
    );
}


export default function App() {
    return (
        <GameStateProvider>
            <AppContent />
        </GameStateProvider>
    );
}