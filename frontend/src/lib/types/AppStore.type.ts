export interface IAppStore {
    isShowFirstEnterManual: boolean;
    language: string;
    setLanguage: (language: string) => void;
    setShowFirstEnterManual: () => void;
    unsetShowFirstEnterManual: () => void;
}
