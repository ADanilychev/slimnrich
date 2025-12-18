import { IUploadResultPayload } from '@/lib/types/services/upload.type';

export interface IUploadFoodForm extends IUploadResultPayload {
    file: File | null;
}
