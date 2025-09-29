import React, { useState, useMemo, useEffect } from 'react';
import type { BotProfile, Cosmetic, PieceStyle, PieceEffect, Avatar, GameTheme, CosmeticType, Emoji } from '../types';
import { useGameState } from '../context/GameStateContext';
import { BOTS, ALL_COSMETICS, getXpForNextLevel, MUSIC_TRACKS } from '../constants';
import Modal from './Modal';
import { useSound } from '../hooks/useSound';

const FeaturedItem: React.FC<{onGoToShop: () => void, itemOffset?: number}> = ({onGoToShop, itemOffset = 0}) => {
    const { gameState } = useGameState();
    const { playSound } = useSound();
    
    // Widen the pool of featured items to all unowned cosmetics
    const unownedItems = useMemo(() => {
        const potentialItems = ALL_COSMETICS.filter(c => !gameState.ownedCosmeticIds.includes(c.id) && c.price > 0);
        // If all items are owned, show a default cool item instead of nothing
        return potentialItems.length > 0 ? potentialItems : [ALL_COSMETICS.find(c => c.id === 'boom_rocket')!];
    }, [gameState.ownedCosmeticIds]);

    const [currentItemIndex, setCurrentItemIndex] = useState(() => (itemOffset % unownedItems.length));

    useEffect(() => {
         // Ensure the index is valid if the number of unowned items changes
        if (currentItemIndex >= unownedItems.length) {
            setCurrentItemIndex(0);
        }
    }, [unownedItems.length, currentItemIndex]);

    useEffect(() => {
        if (unownedItems.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentItemIndex(prev => (prev + 1) % unownedItems.length);
        }, 5000 + itemOffset * 250); // Rotate every ~5 seconds, slight offset to desync
        return () => clearInterval(timer);
    }, [unownedItems.length, itemOffset]);

    const featuredItem = unownedItems[currentItemIndex];

    if (!featuredItem) return null;

    const renderPreview = (cosmetic: Cosmetic) => {
      switch(cosmetic.type) {
          case 'piece': {
              const PieceComp = (cosmetic.item as PieceStyle).component;
              return <PieceComp className="w-14 h-14 text-cyan-300" />;
          }
          case 'effect': {
              const PreviewComp = (cosmetic.item as PieceEffect).previewComponent;
              return <div className="w-14 h-14 flex items-center justify-center text-cyan-300"><PreviewComp /></div>;
          }
           case 'theme': {
              const theme = cosmetic.item as GameTheme;
              return <div className={`w-14 h-14 rounded-md flex items-center justify-center p-2 ${theme.boardBg}`}><div className={`w-10 h-10 rounded ${theme.cellBg} border-2 ${theme.gridColor}`} /></div>;
          }
          case 'avatar': {
              return <img src={(cosmetic.item as Avatar).url} alt={cosmetic.name} className="w-14 h-14 rounded-full object-cover bg-slate-700" />;
          }
          case 'emoji': {
              return <span className="text-4xl">{(cosmetic.item as Emoji).emoji}</span>
          }
          default: return null;
      }
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 w-full h-full flex flex-col items-center justify-center text-center">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Featured Item</h3>
            <div className="w-20 h-20 flex items-center justify-center">{renderPreview(featuredItem)}</div>
            <p className="text-white font-semibold mt-1 text-sm h-10 flex items-center">{featuredItem.name}</p>
            <button onClick={() => { playSound('click'); onGoToShop(); }} className="mt-2 text-xs bg-yellow-500 text-black font-bold px-3 py-1 rounded-full hover:bg-yellow-400 transition-colors">
                Go to Shop
            </button>
        </div>
    );
}

const PlayerProfile: React.FC = () => {
    const { gameState, setPlayerName } = useGameState();
    const { playerName, playerLevel, playerXp, wins, losses, draws, activeAvatar, coins } = gameState;
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(playerName);

    const handleNameChange = () => {
        if (nameInput.trim() && nameInput.trim().length <= 15) {
            setPlayerName(nameInput.trim());
        } else {
            setNameInput(playerName); // Reset if invalid
        }
        setIsEditingName(false);
    };
    
    const avatarUrl = activeAvatar.url;
    const xpForNextLevel = getXpForNextLevel(playerLevel);
    const xpPercentage = (playerXp / xpForNextLevel) * 100;


    return (
        <div className="group relative bg-slate-800/50 border border-slate-700 rounded-xl p-4 w-full h-full transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-4">
                    <img src={avatarUrl} alt="Player Avatar" className="w-16 h-16 rounded-full flex-shrink-0 border-2 border-slate-600 group-hover:border-cyan-400 transition-colors object-cover bg-slate-700" />
                    <div className="flex-grow text-left">
                        {isEditingName ? (
                            <input 
                                type="text" 
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                onBlur={handleNameChange}
                                onKeyPress={(e) => e.key === 'Enter' && handleNameChange()}
                                className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-lg font-bold w-full"
                                autoFocus
                                maxLength={15}
                            />
                        ) : (
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-white truncate">{playerName}</h2>
                                <button onClick={() => setIsEditingName(true)} className="text-slate-400 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                                </button>
                            </div>
                        )}
                         <div className="flex items-center gap-4 mt-1">
                            <span className="font-semibold text-cyan-400 text-sm">Level {playerLevel}</span>
                            <div className="flex items-center gap-1.5">
                                <span className="text-yellow-400 font-bold text-sm">{coins}</span>
                                <span className="text-yellow-400">💰</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-3">
                    <div className="flex justify-between items-baseline text-xs text-slate-400 mb-1 px-1">
                        <span className="font-semibold">XP</span>
                        <span>{playerXp} / {xpForNextLevel}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${xpPercentage}%` }}></div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mt-4">
                    <div className="transition-transform duration-200 hover:scale-110 p-2 rounded-lg">
                        <p className="text-green-400 font-bold text-xl">{wins}</p>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Wins</p>
                    </div>
                    <div className="transition-transform duration-200 hover:scale-110 p-2 rounded-lg">
                        <p className="text-red-400 font-bold text-xl">{losses}</p>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Losses</p>
                    </div>
                    <div className="transition-transform duration-200 hover:scale-110 p-2 rounded-lg">
                        <p className="text-cyan-400 font-bold text-xl">{wins + losses + draws}</p>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Total</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

const BotCard: React.FC<{ bot: BotProfile; onChallenge: () => void; }> = ({ bot, onChallenge }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center transition-all duration-300 flex flex-col backdrop-blur-sm hover:border-cyan-400">
        <img src={bot.avatar} alt={bot.name} className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-slate-600 object-cover bg-slate-700"/>
        <h3 className="text-lg font-bold text-white mb-1">{bot.name}</h3>
        <p className="text-slate-400 text-xs mb-3 flex-grow">{bot.description}</p>
        <button
            onClick={onChallenge}
            className="mt-auto w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-3 rounded-lg transition-all text-sm"
        >
            Challenge
        </button>
    </div>
);


interface MainMenuProps {
  onStartGame: (bot: BotProfile) => void;
  onGoToShop: () => void;
  onGoToInventory: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onGoToShop, onGoToInventory }) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { gameState, toggleSound, toggleMusic, equipMusic } = useGameState();
  const { playSound } = useSound();

  const handleChallengeClick = (bot: BotProfile) => {
    playSound('click');
    onStartGame(bot);
  }

  const handleSettingsClick = () => {
    playSound('click');
    setIsSettingsModalOpen(true);
  }

  const handleToggleSound = () => {
      playSound('click');
      toggleSound();
  }
  const handleToggleMusic = () => {
      playSound('click');
      toggleMusic();
  }
  
  const handleMusicSelect = (musicUrl: string) => {
    playSound('click');
    equipMusic(musicUrl);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 flex flex-col items-center justify-center overflow-hidden relative">
       <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%231e293b%22%20fill-opacity%3D%220.4%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
       
       <div className="w-full max-w-5xl text-center z-10 flex flex-col items-center">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-1">
                Caro <span className="text-cyan-400">AI Arena</span>
            </h1>
            <p className="text-slate-400 text-md mb-8">Five in a row. Infinite possibilities.</p>
            
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="md:col-span-1"><PlayerProfile /></div>
                <div className="md:col-span-1"><FeaturedItem onGoToShop={onGoToShop} itemOffset={0} /></div>
                <div className="md:col-span-1 grid grid-cols-2 gap-4 h-full">
                    <button
                        onClick={onGoToShop}
                        className="w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold p-3 rounded-lg text-base transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                    >
                        Shop 🛒
                    </button>
                    <button
                        onClick={onGoToInventory}
                        className="w-full h-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-white font-bold p-3 rounded-lg text-base transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                    >
                        Inventory 🎒
                    </button>
                    <button
                        onClick={handleSettingsClick}
                        className="w-full h-full bg-slate-700 hover:bg-slate-600 text-white font-bold p-3 rounded-lg text-base transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                    >
                        Settings ⚙️
                    </button>
                    <button
                        disabled
                        className="w-full h-full bg-slate-800 text-slate-500 font-bold p-3 rounded-lg text-base transition-all duration-300 shadow-lg flex items-center justify-center cursor-not-allowed"
                    >
                        Play Online 🌎
                    </button>
                </div>
            </div>

            <div className="w-full max-w-4xl">
                <h2 className="text-2xl font-bold text-center mb-4">Choose Your Opponent</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {BOTS.map(bot => <BotCard key={bot.id} bot={bot} onChallenge={() => handleChallengeClick(bot)} />)}
                </div>
            </div>
       </div>

        <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Settings">
             <div className="text-white divide-y divide-slate-700 -mx-6 -my-6">
                <div className="p-6">
                    <button
                        onClick={handleToggleSound}
                        className="w-full flex justify-between items-center transition-colors"
                    >
                        <span className="font-semibold text-slate-300">Sound</span>
                        <span className={`font-bold ${gameState.isSoundOn ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {gameState.isSoundOn ? 'ON' : 'OFF'}
                        </span>
                    </button>
                    <button
                        onClick={handleToggleMusic}
                        className="w-full flex justify-between items-center mt-4 transition-colors"
                    >
                        <span className="font-semibold text-slate-300">Music</span>
                        <span className={`font-bold ${gameState.isMusicOn ? 'text-cyan-400' : 'text-slate-500'}`}>
                            {gameState.isMusicOn ? 'ON' : 'OFF'}
                        </span>
                    </button>
                </div>
                <div className="p-6">
                    <h3 className="font-semibold text-slate-300 mb-3">Select Music</h3>
                    <div className="space-y-2">
                        {MUSIC_TRACKS.map(track => (
                            <button key={track.id} onClick={() => handleMusicSelect(track.url)} className={`w-full text-left px-3 py-2 rounded-md transition-colors ${gameState.activeMusicUrl === track.url ? 'bg-cyan-500 text-black font-semibold' : 'bg-slate-800 hover:bg-slate-700'}`}>
                                {track.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    </div>
  );
};

export default MainMenu;
