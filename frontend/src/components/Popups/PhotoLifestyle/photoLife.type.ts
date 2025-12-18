import { IUploadResultPayload } from '@/lib/types/services/upload.type';

export interface IUploadLifeForm extends IUploadResultPayload {
    file: File | null;
}
