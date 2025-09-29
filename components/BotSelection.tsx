import React from 'react';
import { BOTS } from '../constants';
import type { BotProfile } from '../types';

const BotCard: React.FC<{ bot: BotProfile; onChallenge: (bot: BotProfile) => void; }> = ({ bot, onChallenge }) => (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center transform hover:-translate-y-2 transition-transform duration-300 flex flex-col backdrop-blur-sm">
        <img src={bot.avatar} alt={bot.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-slate-600"/>
        <h3 className="text-2xl font-bold text-white mb-2">{bot.name}</h3>
        <p className="text-slate-400 mb-4 flex-grow">{bot.description}</p>
        <button
            onClick={() => onChallenge(bot)}
            className="mt-auto w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-4 rounded-lg transition-all"
        >
            Challenge
        </button>
    </div>
);

interface BotSelectionProps {
  onChallenge: (bot: BotProfile) => void;
  onBack: () => void;
}

const BotSelection: React.FC<BotSelectionProps> = ({ onChallenge, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-8 flex flex-col items-center justify-center relative">
       <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%231e293b%22%20fill-opacity%3D%220.4%22%20fill-rule%3D%22evenodd%22%3E%3Cpath%20d%3D%22M0%2040L40%200H20L0%2020M40%2040V20L20%2040%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>

       <div className="text-center z-10">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Choose Your Opponent</h1>
            <p className="text-slate-400 text-lg mb-10">Select an AI to challenge and test your skills.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {BOTS.map(bot => <BotCard key={bot.id} bot={bot} onChallenge={onChallenge} />)}
            </div>

            <button
                onClick={onBack}
                className="mt-12 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
                Back to Menu
            </button>
       </div>
    </div>
  );
};

export default BotSelection;