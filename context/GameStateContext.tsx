import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { Cosmetic, GameTheme, PieceStyle, Avatar, PieceEffect } from '../types';
import { DEFAULT_THEME, DEFAULT_PIECES_X, DEFAULT_PIECES_O, DEFAULT_AVATAR, getXpForNextLevel, THEMES, DEFAULT_EFFECT } from '../constants';

interface GameState {
  coins: number;
  playerName: string;
  wins: number;
  losses: number;
  playerLevel: number;
  playerXp: number;
  ownedCosmeticIds: string[];
  activeTheme: GameTheme;
  activePieceX: PieceStyle;
  activePieceO: PieceStyle;
  activeAvatar: Avatar;
  activeEffect: PieceEffect;
  isSoundOn: boolean;
  isMusicOn: boolean;
}

interface GameStateContextType {
  gameState: GameState;
  setPlayerName: (name: string) => void;
  incrementWins: () => void;
  incrementLosses: () => void;
  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  purchaseCosmetic: (cosmetic: Cosmetic) => boolean;
  equipTheme: (theme: GameTheme) => void;
  equipPiece: (piece: PieceStyle) => void;
  equipAvatar: (avatar: Avatar) => void;
  equipEffect: (effect: PieceEffect) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'caroGameState_v4';

// Helper to avoid storing React components in JSON
const sanitizeCosmetic = (cosmetic: any) => {
    if (!cosmetic) return null;
    const { component, previewComponent, decoratorComponent, ...rest } = cosmetic;
    return rest;
};

export const GameStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Find the full theme object from our constants
        const activeThemeObject = THEMES.find(t => t.id === parsed.activeTheme?.id) || DEFAULT_THEME;

        return {
          ...parsed,
          activeTheme: activeThemeObject,
          activePieceX: { ...DEFAULT_PIECES_X, ...parsed.activePieceX },
          activePieceO: { ...DEFAULT_PIECES_O, ...parsed.activePieceO },
          activeAvatar: { ...DEFAULT_AVATAR, ...parsed.activeAvatar },
          activeEffect: { ...DEFAULT_EFFECT, ...parsed.activeEffect },
          isSoundOn: parsed.isSoundOn ?? true,
          isMusicOn: parsed.isMusicOn ?? true,
        };
      }
    } catch (error) {
      console.error("Failed to parse game state from localStorage", error);
    }
    return {
      coins: 10000,
      playerName: `Player_${Math.floor(1000 + Math.random() * 9000)}`,
      wins: 0,
      losses: 0,
      playerLevel: 1,
      playerXp: 0,
      ownedCosmeticIds: [DEFAULT_THEME.id, DEFAULT_PIECES_X.id, DEFAULT_PIECES_O.id, DEFAULT_AVATAR.id, DEFAULT_EFFECT.id, 'emoji_wave', 'emoji_gg'],
      activeTheme: DEFAULT_THEME,
      activePieceX: DEFAULT_PIECES_X,
      activePieceO: DEFAULT_PIECES_O,
      activeAvatar: DEFAULT_AVATAR,
      activeEffect: DEFAULT_EFFECT,
      isSoundOn: true,
      isMusicOn: true,
    };
  });

  useEffect(() => {
    try {
        const stateToSave = {
            ...gameState,
            activeTheme: sanitizeCosmetic(gameState.activeTheme),
            activePieceX: sanitizeCosmetic(gameState.activePieceX),
            activePieceO: sanitizeCosmetic(gameState.activePieceO),
            activeAvatar: sanitizeCosmetic(gameState.activeAvatar),
            activeEffect: sanitizeCosmetic(gameState.activeEffect),
        };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save game state to localStorage", error);
    }
  }, [gameState]);

  const setPlayerName = useCallback((name: string) => {
    setGameState(prev => ({...prev, playerName: name}));
  }, []);

  const incrementWins = useCallback(() => {
    setGameState(prev => ({...prev, wins: prev.wins + 1}));
  }, []);
  
  const incrementLosses = useCallback(() => {
    setGameState(prev => ({...prev, losses: prev.losses + 1}));
  }, []);

  const addCoins = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, coins: prev.coins + amount }));
  }, []);
  
  const addXp = useCallback((amount: number) => {
    setGameState(prev => {
        let newXp = prev.playerXp + amount;
        let newLevel = prev.playerLevel;
        let xpNeeded = getXpForNextLevel(newLevel);
        
        while (newXp >= xpNeeded) {
            newXp -= xpNeeded;
            newLevel++;
            xpNeeded = getXpForNextLevel(newLevel);
        }

        return { ...prev, playerLevel: newLevel, playerXp: newXp };
    });
  }, []);

    const equipEffect = useCallback((effect: PieceEffect) => {
        if (gameState.ownedCosmeticIds.includes(effect.id)) {
            setGameState(prev => ({ ...prev, activeEffect: effect }));
        }
    }, [gameState.ownedCosmeticIds]);

  const purchaseCosmetic = useCallback((cosmetic: Cosmetic): boolean => {
    if (gameState.coins >= cosmetic.price && !gameState.ownedCosmeticIds.includes(cosmetic.id)) {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - cosmetic.price,
        ownedCosmeticIds: [...prev.ownedCosmeticIds, cosmetic.id],
      }));
       // Auto-equip after purchase
        if (cosmetic.type === 'effect') {
            equipEffect(cosmetic.item as PieceEffect);
        }
      return true;
    }
    return false;
  }, [gameState.coins, gameState.ownedCosmeticIds, equipEffect]);

  const equipTheme = useCallback((theme: GameTheme) => {
    if (gameState.ownedCosmeticIds.includes(theme.id)) {
      setGameState(prev => ({ ...prev, activeTheme: theme }));
    }
  }, [gameState.ownedCosmeticIds]);

  const equipPiece = useCallback((piece: PieceStyle) => {
    if (gameState.ownedCosmeticIds.includes(piece.id)) {
      setGameState(prev => ({ ...prev, activePieceX: piece, activePieceO: piece }));
    }
  }, [gameState.ownedCosmeticIds]);
  
  const equipAvatar = useCallback((avatar: Avatar) => {
    if (gameState.ownedCosmeticIds.includes(avatar.id)) {
        setGameState(prev => ({ ...prev, activeAvatar: avatar}));
    }
  }, [gameState.ownedCosmeticIds]);

  const toggleSound = useCallback(() => {
    setGameState(prev => ({ ...prev, isSoundOn: !prev.isSoundOn }));
  }, []);

  const toggleMusic = useCallback(() => {
    setGameState(prev => ({ ...prev, isMusicOn: !prev.isMusicOn }));
  }, []);

  return (
    <GameStateContext.Provider value={{ gameState, setPlayerName, incrementWins, incrementLosses, addCoins, addXp, purchaseCosmetic, equipTheme, equipPiece, equipAvatar, equipEffect, toggleSound, toggleMusic }}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = (): GameStateContextType => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};
