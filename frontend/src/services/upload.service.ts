import { IUploadResponse, IUploadResultPayload } from '@/lib/types/services/upload.type';

import { API } from '@/api';

class uploadService {
    async uploadResult(payload: IUploadResultPayload, file: File): Promise<IUploadResponse> {
        const formData = new FormData();

        formData.append('form_data', JSON.stringify({ ...payload, food_time: payload.food_time?.toLowerCase() }));
        formData.append('file', file);

        return (await API.post(`/upload-photo`, formData)).data;
    }
}

export const UploadService = new uploadService();
