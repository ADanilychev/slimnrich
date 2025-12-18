import { create } from 'zustand';

import { IAppStore } from '@/lib/types/AppStore.type';

export const useAppStore = create<IAppStore>((set) => ({
    isShowFirstEnterManual: false,
    language: '',
    setLanguage: (language: string) => {
        set({
            language,
        });
    },
    setShowFirstEnterManual: () => {
        set({
            isShowFirstEnterManual: true,
        });
    },
    unsetShowFirstEnterManual: () => {
        set({
            isShowFirstEnterManual: false,
        });
    },
}));
