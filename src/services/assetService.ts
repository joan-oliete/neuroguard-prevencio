import {
    ref,
    uploadBytes,
    getDownloadURL,
    listAll,
    deleteObject,
    StorageReference
} from 'firebase/storage';
import { storage } from './firebase';

export interface GameAsset {
    name: string;
    url: string;
    path: string;
    type: 'image' | 'video' | 'other';
}

/**
 * Uploads a file to a specific path in Firebase Storage
 * @param file The file to upload
 * @param path The folder path (e.g., 'gym/memory')
 * @returns The download URL of the uploaded file
 */
export const uploadGameAsset = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, `${path}/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
};

/**
 * Retrieves all assets from a specific folder
 * @param path The folder path
 * @returns List of GameAsset objects
 */
export const getGameAssets = async (path: string): Promise<GameAsset[]> => {
    const folderRef = ref(storage, path);
    const result = await listAll(folderRef);

    const assets: GameAsset[] = await Promise.all(
        result.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return {
                name: itemRef.name,
                url: url,
                path: itemRef.fullPath,
                type: isVideo(itemRef.name) ? 'video' : 'image'
            };
        })
    );

    return assets;
};

/**
 * Deletes an asset by its full path
 */
export const deleteAsset = async (fullPath: string): Promise<void> => {
    const assetRef = ref(storage, fullPath);
    await deleteObject(assetRef);
};

// Helper
const isVideo = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['mp4', 'webm', 'mov'].includes(ext || '');
};
