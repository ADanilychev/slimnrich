import { IUploadResultPayload } from '@/lib/types/services/upload.type';

export interface IUploadWeightForm extends IUploadResultPayload {
    file: File | null;
}
