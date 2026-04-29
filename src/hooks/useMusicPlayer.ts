import { useMusicContext } from '../context/MusicContext';

/**
 * useMusicPlayer Hook - Wrapper for MusicContext
 * This ensures that all screens share the same global state.
 */
export const useMusicPlayer = () => {
  return useMusicContext();
};
