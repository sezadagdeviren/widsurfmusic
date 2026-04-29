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

/**
 * Metadata çıkarır ve kapak görselini diske kaydeder.
 * OPTİMİZASYON: Tüm dosyayı okumak yerine sadece ilk 300KB'ı okur (ID3v2 etiketleri genelde baştadır).
 */
export const extractArtwork = async (filePath: string, trackId: string): Promise<MetadataResult> => {
  try {
    const cleanPath = filePath.startsWith('file://') ? filePath.replace('file://', '') : filePath;
    const exists = await RNFS.exists(cleanPath);
    
    if (!exists) return {};

    // Dosyanın sadece ilk 300KB'lık kısmını oku (ID3v2 etiketleri genelde buradadır)
    // Bu sayede 20MB'lık dosyayı belleğe yüklemekten kurtuluruz.
    const READ_SIZE = 300 * 1024; 
    const fileContent = await RNFS.read(cleanPath, READ_SIZE, 0, 'base64');
    const buffer = Buffer.from(fileContent, 'base64');

    return new Promise((resolve) => {
      jsmediatags.read(buffer, {
        onSuccess: async (tag: any) => {
          const { image, picture, title, artist } = tag.tags;
          const artworkData = image || picture;
          let artworkPath: string | undefined;
          
          if (artworkData) {
            try {
              const base64String = Buffer.from(artworkData.data).toString('base64');
              const artworkDir = `${RNFS.DocumentDirectoryPath}/artworks`;
              
              if (!(await RNFS.exists(artworkDir))) {
                await RNFS.mkdir(artworkDir);
              }
              
              const fileName = `${trackId}.jpg`;
              artworkPath = `${artworkDir}/${fileName}`;
              
              await RNFS.writeFile(artworkPath, base64String, 'base64');
            } catch (err) {
              console.error('Artwork save error:', err);
            }
          }

          resolve({
            artwork: artworkPath,
            title: title || undefined,
            artist: artist || undefined
          });
        },
        onError: (error: any) => {
          // Eğer 300KB yetmediyse veya ID3v1 (dosya sonunda) kullanılıyorsa buraya düşebilir.
          // Bu durumda sessizce boş döner veya istenirse tüm dosya okunabilir (önerilmez).
          resolve({});
        }
      });
    });
  } catch (error) {
    console.error('extractArtwork exception:', error);
    return {};
  }
};
