import { IEditMetaPayload } from '@/lib/types/services/photo.type';

import { API } from '@/api';

class photoService {
    async editMeta(data: IEditMetaPayload): Promise<{ result: boolean }> {
        return (await API.post('/photos', data)).data;
    }

    async sharePhoto(fileId: number, text?: string): Promise<{ result: string }> {
        return (
            await API.put(`/photos?file_id=${fileId}`, {
                text,
            })
        ).data;
    }
}

export const PhotoService = new photoService();
