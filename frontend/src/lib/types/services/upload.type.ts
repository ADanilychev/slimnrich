export interface IUploadResultPayload {
    file_type: (typeof UPLOAD_FILE_TYPE)[keyof typeof UPLOAD_FILE_TYPE];
    title?: string | null;
    about?: string | null;
    weight?: number | null;
    food_time?: string | null;
    calories?: number | null;
}

export interface IUploadResponse {
    file_type: (typeof UPLOAD_FILE_TYPE)[keyof typeof UPLOAD_FILE_TYPE];
    change: number;
    bonus: number;
    numbers: string;
}

export const UPLOAD_FILE_TYPE = {
    WEIGHT: 'weight',
    FOOD: 'food',
    LIFE: 'life',
};
