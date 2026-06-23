import { create } from 'zustand';

export interface TransferredFile {
  id: string;
  name: string;
  size: number;
  type: string;
  receivedAt: number;
  path: string;
}

interface FileStore {
  files: TransferredFile[];
  addFile: (file: TransferredFile) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  getFiles: () => TransferredFile[];
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],

  addFile: (file: TransferredFile) => {
    set((state) => ({
      files: [file, ...state.files],
    }));
  },

  removeFile: (id: string) => {
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    }));
  },

  clearFiles: () => {
    set({ files: [] });
  },

  getFiles: () => get().files,
}));
