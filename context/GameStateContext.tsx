import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import type { Cosmetic, GameTheme, PieceStyle, Avatar, PieceEffect, VictoryEffect, BoomEffect } from '../types';
import { DEFAULT_THEME, DEFAULT_PIECES_X, DEFAULT_PIECES_O, DEFAULT_AVATAR, getXpForNextLevel, THEMES, DEFAULT_EFFECT, DEFAULT_VICTORY_EFFECT, DEFAULT_BOOM_EFFECT, ALL_COSMETICS, MUSIC_TRACKS, COIN_REWARD, XP_REWARD } from '../constants';

const DEFAULT_EMOJI_IDS = ALL_COSMETICS.filter(c => c.type === 'emoji' && c.price === 0).map(c => c.id);

interface GameState {
  coins: number;
  playerName: string;
  wins: number;
  losses: number;
  draws: number;
  playerLevel: number;
  playerXp: number;
  ownedCosmeticIds: string[];
  emojiInventory: Record<string, number>; // For consumable emojis
  botStats: Record<string, { wins: number; losses: number; draws: number; }>; // BotId -> stats
  activeTheme: GameTheme;
  activePieceX: PieceStyle;
  activePieceO: PieceStyle;
  activeAvatar: Avatar;
  activeEffect: PieceEffect;
  activeVictoryEffect: VictoryEffect;
  activeBoomEffect: BoomEffect;
  isSoundOn: boolean;
  isMusicOn: boolean;
  activeMusicUrl: string;
  lastProcessedGameId: string | null;
}

interface GameStateContextType {
  gameState: GameState;
  setPlayerName: (name: string) => void;
  applyGameResult: (result: 'win' | 'loss' | 'draw', botId: string, gameId: string | null) => void;
  spendCoins: (amount: number) => boolean;
  purchaseCosmetic: (cosmetic: Cosmetic) => boolean;
  consumeEmoji: (emojiId: string) => void;
  equipTheme: (theme: GameTheme) => void;
  equipPiece: (piece: PieceStyle) => void;
  equipAvatar: (avatar: Avatar) => void;
  equipEffect: (effect: PieceEffect) => void;
  equipVictoryEffect: (effect: VictoryEffect) => void;
  equipBoomEffect: (effect: BoomEffect) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  equipMusic: (musicUrl: string) => void;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'caroGameState_v8'; // Version bump for music selection

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
          activeVictoryEffect: { ...DEFAULT_VICTORY_EFFECT, ...parsed.activeVictoryEffect },
          activeBoomEffect: { ...DEFAULT_BOOM_EFFECT, ...parsed.activeBoomEffect },
          isSoundOn: parsed.isSoundOn ?? true,
          isMusicOn: parsed.isMusicOn ?? true,
          activeMusicUrl: parsed.activeMusicUrl ?? MUSIC_TRACKS[0].url,
          emojiInventory: parsed.emojiInventory ?? {},
          botStats: parsed.botStats ?? {},
          draws: parsed.draws ?? 0,
          lastProcessedGameId: parsed.lastProcessedGameId ?? null,
        };
      }
    } catch (error) {
      console.error("Failed to parse game state from localStorage", error);
    }
    return {
      coins: 10000, // Increased for testing
      playerName: `Player_${Math.floor(1000 + Math.random() * 9000)}`,
      wins: 0,
      losses: 0,
      draws: 0,
      playerLevel: 1,
      playerXp: 0,
      ownedCosmeticIds: [DEFAULT_THEME.id, DEFAULT_PIECES_X.id, DEFAULT_PIECES_O.id, DEFAULT_AVATAR.id, DEFAULT_EFFECT.id, DEFAULT_VICTORY_EFFECT.id, DEFAULT_BOOM_EFFECT.id, ...DEFAULT_EMOJI_IDS],
      emojiInventory: {},
      botStats: {},
      activeTheme: DEFAULT_THEME,
      activePieceX: DEFAULT_PIECES_X,
      activePieceO: DEFAULT_PIECES_O,
      activeAvatar: DEFAULT_AVATAR,
      activeEffect: DEFAULT_EFFECT,
      activeVictoryEffect: DEFAULT_VICTORY_EFFECT,
      activeBoomEffect: DEFAULT_BOOM_EFFECT,
      isSoundOn: true,
      isMusicOn: true,
      activeMusicUrl: MUSIC_TRACKS[0].url,
      lastProcessedGameId: null,
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
            activeVictoryEffect: sanitizeCosmetic(gameState.activeVictoryEffect),
            activeBoomEffect: sanitizeCosmetic(gameState.activeBoomEffect),
        };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save game state to localStorage", error);
    }
  }, [gameState]);

  const setPlayerName = useCallback((name: string) => {
    setGameState(prev => ({...prev, playerName: name}));
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    if (gameState.coins < amount) {
      return false;
    }
    setGameState(prev => ({...prev, coins: prev.coins - amount}));
    return true;
  }, [gameState.coins]);
  
  const applyGameResult = useCallback((result: 'win' | 'loss' | 'draw', botId: string, gameId: string | null) => {
    setGameState(prev => {
        if (gameId && prev.lastProcessedGameId === gameId) {
            console.warn(`Attempted to process game result for gameId ${gameId} twice. Ignoring.`);
            return prev;
        }

        const xpToAdd = XP_REWARD[result];
        const coinsToAdd = COIN_REWARD[result];

        let newXp = prev.playerXp + xpToAdd;
        let newLevel = prev.playerLevel;
        let xpNeeded = getXpForNextLevel(newLevel);
        while (newXp >= xpNeeded) {
            newXp -= xpNeeded;
            newLevel++;
            xpNeeded = getXpForNextLevel(newLevel);
        }

        const newBotStats = { ...prev.botStats };
        if (!newBotStats[botId]) newBotStats[botId] = { wins: 0, losses: 0, draws: 0 };

        let newWins = prev.wins;
        let newLosses = prev.losses;
        let newDraws = prev.draws;

        if (result === 'win') {
            newBotStats[botId].wins += 1;
            newWins += 1;
        } else if (result === 'draw') {
            newBotStats[botId].draws += 1;
            newDraws += 1;
        } else {
            newBotStats[botId].losses += 1;
            newLosses += 1;
        }

        return {
            ...prev,
            coins: prev.coins + coinsToAdd,
            playerXp: newXp,
            playerLevel: newLevel,
            wins: newWins,
            losses: newLosses,
            draws: newDraws,
            botStats: newBotStats,
            lastProcessedGameId: gameId || prev.lastProcessedGameId,
        };
    });
}, []);
  
  const consumeEmoji = useCallback((emojiId: string) => {
    // Default emojis are not consumable
    if (DEFAULT_EMOJI_IDS.includes(emojiId)) return;

    setGameState(prev => {
        const newInventory = { ...prev.emojiInventory };
        if (newInventory[emojiId] > 0) {
            newInventory[emojiId] -= 1;
            if (newInventory[emojiId] === 0) {
                delete newInventory[emojiId];
            }
        }
        return { ...prev, emojiInventory: newInventory };
    });
  }, []);

    const equipEffect = useCallback((effect: PieceEffect) => {
        if (gameState.ownedCosmeticIds.includes(effect.id)) {
            setGameState(prev => ({ ...prev, activeEffect: effect }));
        }
    }, [gameState.ownedCosmeticIds]);

    const equipVictoryEffect = useCallback((effect: VictoryEffect) => {
        if (gameState.ownedCosmeticIds.includes(effect.id)) {
            setGameState(prev => ({ ...prev, activeVictoryEffect: effect }));
        }
    }, [gameState.ownedCosmeticIds]);

    const equipBoomEffect = useCallback((effect: BoomEffect) => {
        if (gameState.ownedCosmeticIds.includes(effect.id)) {
            setGameState(prev => ({ ...prev, activeBoomEffect: effect }));
        }
    }, [gameState.ownedCosmeticIds]);

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

  const purchaseCosmetic = useCallback((cosmetic: Cosmetic): boolean => {
    if (gameState.coins < cosmetic.price) return false;

    // Handle consumable emojis separately
    if (cosmetic.type === 'emoji' && cosmetic.price > 0) {
        setGameState(prev => {
            const newInventory = { ...prev.emojiInventory };
            newInventory[cosmetic.id] = (newInventory[cosmetic.id] || 0) + 1;
            return {
                ...prev,
                coins: prev.coins - cosmetic.price,
                emojiInventory: newInventory,
            };
        });
        return true;
    }
    
    // Handle permanent items
    if (!gameState.ownedCosmeticIds.includes(cosmetic.id)) {
      setGameState(prev => ({
        ...prev,
        coins: prev.coins - cosmetic.price,
        ownedCosmeticIds: [...prev.ownedCosmeticIds, cosmetic.id],
      }));
       // Auto-equip permanent items after purchase
        if (cosmetic.type === 'effect') equipEffect(cosmetic.item as PieceEffect);
        if (cosmetic.type === 'victory') equipVictoryEffect(cosmetic.item as VictoryEffect);
        if (cosmetic.type === 'boom') equipBoomEffect(cosmetic.item as BoomEffect);
        if (cosmetic.type === 'theme') equipTheme(cosmetic.item as GameTheme);
        if (cosmetic.type === 'avatar') equipAvatar(cosmetic.item as Avatar);
        if (cosmetic.type === 'piece') equipPiece(cosmetic.item as PieceStyle);

      return true;
    }

    return false;
  }, [gameState.coins, gameState.ownedCosmeticIds, gameState.emojiInventory, equipEffect, equipVictoryEffect, equipBoomEffect, equipTheme, equipAvatar, equipPiece]);

  const toggleSound = useCallback(() => {
    setGameState(prev => ({ ...prev, isSoundOn: !prev.isSoundOn }));
  }, []);

  const toggleMusic = useCallback(() => {
    setGameState(prev => ({ ...prev, isMusicOn: !prev.isMusicOn }));
  }, []);

  const equipMusic = useCallback((musicUrl: string) => {
    setGameState(prev => ({ ...prev, activeMusicUrl: musicUrl }));
  }, []);

  return (
    <GameStateContext.Provider value={{ gameState, setPlayerName, applyGameResult, spendCoins, purchaseCosmetic, consumeEmoji, equipTheme, equipPiece, equipAvatar, equipEffect, equipVictoryEffect, equipBoomEffect, toggleSound, toggleMusic, equipMusic }}>
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