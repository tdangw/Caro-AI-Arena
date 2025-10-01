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

const AppContent: React.FC = () => {
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
    const [hasInteracted, setHasInteracted] = useState(false);
    const { gameState } = useGameState();
    const { playSound, playMusic, stopMusic } = useSound();

    // Effect to detect the first user interaction to allow audio playback, per browser policy.
    useEffect(() => {
        if (hasInteracted) return;

        const handleFirstInteraction = () => {
            setHasInteracted(true);
        };
        
        // Listen for both click and keydown for comprehensive interaction detection.
        // The { once: true } option automatically removes the listener after it fires.
        window.addEventListener('click', handleFirstInteraction, { once: true });
        window.addEventListener('keydown', handleFirstInteraction, { once: true });

        return () => {
            // Cleanup in case the component unmounts before interaction.
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
        };
    }, [hasInteracted]);


    useEffect(() => {
        // Only attempt to control music if the user has interacted with the page.
        if (hasInteracted) {
            if (view === 'menu' || view === 'game') {
                playMusic();
            } else {
                stopMusic();
            }
        }
    }, [view, playMusic, stopMusic, hasInteracted]);

    const handleStartGame = useCallback((bot: BotProfile) => {
        try {
            playSound('click');
            localStorage.setItem(ACTIVE_GAME_BOT_KEY, JSON.stringify(bot));
            setActiveBot(bot);
            setView('game');
        } catch (error) {
            console.error("Failed to save active bot:", error);
        }
    }, [playSound]);

    const handleGoToShop = useCallback(() => {
        playSound('click');
        setView('shop');
    }, [playSound]);
    const handleGoToInventory = useCallback(() => {
        playSound('click');
        setView('inventory');
    }, [playSound]);
    
    const handleBackToMenu = useCallback(() => {
        playSound('click');
        setView('menu');
        setActiveBot(null);
        setOverlay(null);
        localStorage.removeItem(ACTIVE_GAME_BOT_KEY);
        localStorage.removeItem('caroGameState_inProgress'); 
    }, [playSound]);

    const handleOpenShopOverlay = () => {
        playSound('click');
        setOverlay('shop');
    }
    const handleOpenInventoryOverlay = () => {
        playSound('click');
        setOverlay('inventory');
    }
    const handleCloseOverlay = () => {
        playSound('click');
        setOverlay(null);
    }
    
    const handleGameEnd = useCallback(() => {
        // The game result is now applied within GameScreen as soon as the game ends.
        // This function is only responsible for navigating back to the main menu.
        handleBackToMenu();
    }, [handleBackToMenu]);

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
        <div className="bg-slate-900 relative">
            {renderView()}
            {overlay && (
                <div className="fixed inset-0 z-50 bg-black/70 p-4 sm:p-8 overflow-y-auto">
                    {overlay === 'shop' && <Shop onBack={handleCloseOverlay} />}
                    {overlay === 'inventory' && <Inventory onBack={handleCloseOverlay} />}
                </div>
            )}
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