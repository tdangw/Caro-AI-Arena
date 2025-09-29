
import React, { useState, useCallback } from 'react';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import Shop from './components/Shop';
import Inventory from './components/Inventory';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import type { BotProfile } from './types';
import { COIN_REWARD, XP_REWARD } from './constants';

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
    const { gameState, addCoins, addXp, incrementWins, incrementLosses } = useGameState();

    const handleStartGame = useCallback((bot: BotProfile) => {
        try {
            localStorage.setItem(ACTIVE_GAME_BOT_KEY, JSON.stringify(bot));
            setActiveBot(bot);
            setView('game');
        } catch (error) {
            console.error("Failed to save active bot:", error);
        }
    }, []);

    const handleGoToShop = useCallback(() => setView('shop'), []);
    const handleGoToInventory = useCallback(() => setView('inventory'), []);
    const handleBackToMenu = useCallback(() => {
        setView('menu');
        setActiveBot(null);
        setOverlay(null);
        localStorage.removeItem(ACTIVE_GAME_BOT_KEY);
        localStorage.removeItem('caroGameState_inProgress'); 
    }, []);

    const handleOpenShopOverlay = () => setOverlay('shop');
    const handleOpenInventoryOverlay = () => setOverlay('inventory');
    const handleCloseOverlay = () => setOverlay(null);
    
    const handleGameEnd = useCallback((result: 'win' | 'loss' | 'draw') => {
        setOverlay(null); // Close any overlays when game ends
        if (result === 'win') {
            addCoins(COIN_REWARD.win);
            addXp(XP_REWARD.win);
            incrementWins();
        } else if (result === 'draw') {
            addCoins(COIN_REWARD.draw);
            addXp(XP_REWARD.draw);
        } else { // Loss
            addCoins(COIN_REWARD.loss);
            addXp(XP_REWARD.loss);
            incrementLosses();
        }
    }, [addCoins, addXp, incrementWins, incrementLosses]);

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
                            onExit={handleBackToMenu} 
                            onGameEnd={handleGameEnd} 
                            theme={gameState.activeTheme} 
                            pieces={{ X: gameState.activePieceX, O: gameState.activePieceO }}
                            playerInfo={{name: gameState.playerName, level: gameState.playerLevel, avatar: gameState.activeAvatar, xp: gameState.playerXp, wins: gameState.wins, losses: gameState.losses}}
                            activeEffect={gameState.activeEffect}
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
