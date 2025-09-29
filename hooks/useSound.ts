import { useCallback, useRef, useEffect } from 'react';
import { useGameState } from '../context/GameStateContext';

export type SoundEffect = 'move' | 'win' | 'lose' | 'click';

const soundFiles: Record<SoundEffect, string> = {
    move: '/assets/sounds/move.mp3',
    win: '/assets/sounds/win.mp3',
    lose: '/assets/sounds/lose.mp3',
    click: '/assets/sounds/click.mp3',
};

const musicFile = '/assets/sounds/music.mp3';

const audioCache = new Map<string, HTMLAudioElement>();

const getAudio = (src: string, loop = false): HTMLAudioElement => {
    if (audioCache.has(src)) {
        return audioCache.get(src)!;
    }
    const audio = new Audio(src);
    audio.loop = loop;
    audioCache.set(src, audio);
    return audio;
};


export const useSound = () => {
    const { gameState } = useGameState();
    const musicPlayerRef = useRef<HTMLAudioElement | null>(null);

    const playSound = useCallback((sound: SoundEffect) => {
        if (gameState.isSoundOn) {
            try {
                const audio = getAudio(soundFiles[sound]);
                audio.currentTime = 0;
                // play() returns a promise which can be rejected if the user hasn't interacted with the page yet.
                audio.play().catch(e => console.error(`Sound play failed for ${sound}:`, e));
            } catch (error) {
                console.error(`Could not play sound ${sound}:`, error);
            }
        }
    }, [gameState.isSoundOn]);

    const playMusic = useCallback(() => {
        if (gameState.isMusicOn) {
            try {
                if (!musicPlayerRef.current) {
                    musicPlayerRef.current = getAudio(musicFile, true);
                }
                musicPlayerRef.current.play().catch(e => console.error("Music play failed:", e));
            } catch (error) {
                console.error("Could not play music:", error)
            }
        }
    }, [gameState.isMusicOn]);

    const stopMusic = useCallback(() => {
        if (musicPlayerRef.current) {
            musicPlayerRef.current.pause();
            musicPlayerRef.current.currentTime = 0;
        }
    }, []);

    useEffect(() => {
        // This effect ensures music stops immediately if toggled off in settings.
        if (!gameState.isMusicOn) {
            stopMusic();
        }
    }, [gameState.isMusicOn, stopMusic]);

    return { playSound, playMusic, stopMusic };
};
