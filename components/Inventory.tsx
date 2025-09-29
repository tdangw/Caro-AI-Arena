
import React, { useState } from 'react';
import type { Cosmetic, PieceStyle, Avatar, Emoji, GameTheme, PieceEffect } from '../types';
import { ALL_COSMETICS, DEFAULT_PIECES_X, DEFAULT_AVATAR, DEFAULT_THEME, DEFAULT_EFFECT, PIECE_STYLES, AVATARS, EMOJIS, THEMES, PIECE_EFFECTS } from '../constants';
import { useGameState } from '../context/GameStateContext';

type InventoryCategory = 'Skins' | 'Avatars' | 'Emojis' | 'Themes' | 'Effects';

const Inventory: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { gameState, equipPiece, equipAvatar, equipTheme, equipEffect } = useGameState();
  const [activeTab, setActiveTab] = useState<InventoryCategory>('Skins');

  const cosmeticTypeMap: Record<InventoryCategory, 'piece' | 'avatar' | 'emoji' | 'theme' | 'effect'> = {
    Skins: 'piece',
    Avatars: 'avatar',
    Emojis: 'emoji',
    Themes: 'theme',
    Effects: 'effect',
  };

  const allPossibleCosmetics: Cosmetic[] = [
    ...PIECE_STYLES.map((p) => ({ id: p.id, name: p.name, type: 'piece' as const, price: 0, item: p })),
    ...AVATARS.map(a => ({ id: a.id, name: a.name, type: 'avatar' as const, price: 0, item: a})),
    ...EMOJIS.map(e => ({ id: e.id, name: e.name, type: 'emoji' as const, price: 0, item: e })),
    ...THEMES.map(t => ({ id: t.id, name: t.name, type: 'theme' as const, price: 0, item: t })),
    ...PIECE_EFFECTS.map(e => ({ id: e.id, name: e.name, type: 'effect' as const, price: 0, item: e })),
     { id: DEFAULT_PIECES_X.id, name: DEFAULT_PIECES_X.name, type: 'piece', price: 0, item: DEFAULT_PIECES_X },
     { id: DEFAULT_AVATAR.id, name: DEFAULT_AVATAR.name, type: 'avatar', price: 0, item: DEFAULT_AVATAR },
     { id: DEFAULT_THEME.id, name: DEFAULT_THEME.name, type: 'theme', price: 0, item: DEFAULT_THEME },
     { id: DEFAULT_EFFECT.id, name: DEFAULT_EFFECT.name, type: 'effect', price: 0, item: DEFAULT_EFFECT },
  ];
    
  const allItemsMap = new Map<string, Cosmetic>();
  allPossibleCosmetics.forEach(item => allItemsMap.set(item.id, item));

  const ownedItems = gameState.ownedCosmeticIds
      .map(id => allItemsMap.get(id))
      .filter((c): c is Cosmetic => c !== undefined);

  const filteredCosmetics = ownedItems.filter(c => c.type === cosmeticTypeMap[activeTab as InventoryCategory]);


   const renderItemPreview = (cosmetic: Cosmetic) => {
      switch(cosmetic.type) {
          case 'piece': {
              const PieceComp = (cosmetic.item as PieceStyle).component;
              return <PieceComp className="w-16 h-16 text-cyan-300" />;
          }
          case 'avatar': {
              const AvatarComp = (cosmetic.item as Avatar).component;
              return <AvatarComp className="w-16 h-16" />;
          }
          case 'emoji':
              return <span className="text-4xl">{(cosmetic.item as Emoji).emoji}</span>
          case 'theme': {
              const theme = cosmetic.item as GameTheme;
              return <div className={`w-16 h-16 rounded-md flex items-center justify-center p-2 ${theme.boardBg}`}><div className={`w-10 h-10 rounded ${theme.cellBg} border-2 ${theme.gridColor}`} /></div>;
          }
          case 'effect': {
              const PreviewComp = (cosmetic.item as PieceEffect).previewComponent;
              return <div className="w-16 h-16 flex items-center justify-center text-cyan-300"><PreviewComp /></div>;
          }
          default:
              return null;
      }
  }
  
  const renderContent = () => {
    if (filteredCosmetics.length > 0) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {filteredCosmetics.map(cosmetic => {
                    const isActive = cosmetic.type === 'piece' 
                        ? gameState.activePieceX.id === cosmetic.id
                        : cosmetic.type === 'avatar' 
                        ? gameState.activeAvatar.id === cosmetic.id
                        : cosmetic.type === 'theme'
                        ? gameState.activeTheme.id === cosmetic.id
                        : cosmetic.type === 'effect'
                        ? gameState.activeEffect.id === cosmetic.id
                        : false;
                                    
                    const handleEquip = () => {
                        if (cosmetic.type === 'piece') {
                            equipPiece(cosmetic.item as PieceStyle);
                        } else if (cosmetic.type === 'avatar') {
                            equipAvatar(cosmetic.item as Avatar);
                        } else if (cosmetic.type === 'theme') {
                            equipTheme(cosmetic.item as GameTheme);
                        } else if (cosmetic.type === 'effect') {
                            equipEffect(cosmetic.item as PieceEffect);
                        }
                    }

                    return (
                    <div key={cosmetic.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center transition-all duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1">
                        <div className="h-24 w-24 mb-3 flex items-center justify-center bg-slate-900/70 rounded-lg p-2">
                            {renderItemPreview(cosmetic)}
                        </div>
                        <h3 className="text-md font-semibold text-white mb-2 h-10 flex items-center justify-center">{cosmetic.name}</h3>

                        <button
                            onClick={handleEquip}
                            disabled={isActive || cosmetic.type === 'emoji'}
                            className={`w-full mt-auto py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                                cosmetic.type === 'emoji' 
                                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                                    : isActive 
                                    ? 'bg-green-500 text-white cursor-not-allowed' 
                                    : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                            }`}
                        >
                            {cosmetic.type === 'emoji' ? 'Owned' : isActive ? 'Equipped' : 'Equip'}
                        </button>
                    </div>
                    );
                })}
            </div>
        );
    } else {
        return (
            <div className="text-center py-16">
                <p className="text-slate-400 text-lg">You don't own any items in this category yet.</p>
                <p className="text-slate-500">Visit the shop to get some!</p>
            </div>
        );
    }
  }

  return (
    <div className="p-4 sm:p-8 h-screen bg-slate-900 text-white relative flex flex-col">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%231e293b%22%20fill-opacity%3D%220.4%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
      <div className="max-w-6xl mx-auto relative z-10 w-full flex flex-col flex-grow overflow-hidden">
        <header className="flex-shrink-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold text-cyan-400">Inventory</h1>
              <button onClick={onBack} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Back
              </button>
            </div>
        </header>

        <div className="flex-shrink-0 mb-8 border-b border-slate-700">
            <nav className="flex space-x-1 sm:space-x-2 md:space-x-4 overflow-x-auto pb-px">
                {(['Skins', 'Avatars', 'Emojis', 'Themes', 'Effects'] as InventoryCategory[]).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-3 text-base sm:text-lg font-semibold transition-colors whitespace-nowrap ${activeTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
        
        <main className="flex-grow overflow-y-auto pr-2 -mr-2">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Inventory;