import RNFS from 'react-native-fs';
const jsmediatags = require('jsmediatags/dist/jsmediatags.min.js');
import { Buffer } from 'buffer';
import { MetadataResult } from '../types/music';

// Polyfill Buffer
if (typeof (global as any).Buffer === 'undefined') {
  (global as any).Buffer = Buffer;
}

export const formatTime = (seconds: number) => {
  if (!seconds || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getArtworkUri = (artwork?: string) => {
  if (!artwork) return undefined;
  if (artwork.startsWith('http') || artwork.startsWith('file://') || artwork.startsWith('content://') || artwork.startsWith('data:')) {
    return artwork;
  }
  return `file://${artwork}`;
};

export const extractArtwork = async (filePath: string): Promise<MetadataResult> => {
  try {
    const cleanPath = filePath.startsWith('file://') ? filePath.replace('file://', '') : filePath;
    const exists = await RNFS.exists(cleanPath);
    
    if (!exists) return {};

    // React Native'de jsmediatags doğrudan path okuyamaz. 
    // Dosyayı önce base64 olarak okuyup buffer'a çevirmeliyiz.
    const fileBase64 = await RNFS.readFile(cleanPath, 'base64');
    const buffer = Buffer.from(fileBase64, 'base64');

    return new Promise((resolve) => {
      jsmediatags.read(buffer, {
        onSuccess: (tag: any) => {
          const { image, picture, title, artist } = tag.tags;
          const artworkData = image || picture;
          let artworkUri: string | undefined;
          
          if (artworkData) {
            const base64String = Buffer.from(artworkData.data).toString('base64');
            artworkUri = `data:${artworkData.format};base64,${base64String}`;
          }

          resolve({
            artwork: artworkUri,
            title: title || undefined,
            artist: artist || undefined
          });
        },
        onError: (error: any) => {
          console.log('jsmediatags error:', error);
          resolve({});
        }
      });
    });
  } catch (error) {
    console.error('extractArtwork exception:', error);
    return {};
  }
};
