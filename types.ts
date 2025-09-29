import type React from 'react';

export type Player = 'X' | 'O';
export type CellState = Player | null;
export type BoardState = CellState[][];
export type GameMode = 'pvp' | 'pve';

export interface GameTheme {
  id: string;
  name: string;
  boardBg: string;
  cellBg: string;
  gridColor: string;
  nameColor: string;
  decoratorComponent?: React.FC;
}

export interface PieceStyle {
  id: string;
  name: string;
  component: React.FC<{ className?: string }>;
}

export interface PieceEffect {
  id: string;
  name: string;
  component: React.FC<{ className?: string }>;
  previewComponent: React.FC;
}

export interface VictoryEffect {
  id: string;
  name: string;
  component: React.FC;
  previewComponent: React.FC;
}

export interface BoomEffect {
  id: string;
  name: string;
  component: React.FC<{ winnerCoords?: DOMRect, loserCoords?: DOMRect }>;
  previewComponent: React.FC;
}

export interface Avatar {
    id: string;
    name: string;
    url: string; // Changed from component to url for image path
}

export interface Emoji {
    id: string;
    name: string;
    emoji: string;
}

export type CosmeticType = 'theme' | 'piece' | 'avatar' | 'emoji' | 'effect' | 'victory' | 'boom';

export interface Cosmetic {
  id: string;
  name: string;
  type: CosmeticType;
  price: number;
  item: GameTheme | PieceStyle | Avatar | Emoji | PieceEffect | VictoryEffect | BoomEffect;
}

export interface BotProfile {
    id: string;
    name: string;
    avatar: string; // This is now an image URL
    level: number;
    skillLevel: 'easy' | 'medium' | 'hard';
    description: string;
}
