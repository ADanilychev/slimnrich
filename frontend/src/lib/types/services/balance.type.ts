import { TPaymentMethod } from '@/lib/configs/Payment.config';

export interface ITopUpPayload {
    amount: number;
    method: TPaymentMethod;
}

export interface IWithdrawPayload {
    amount: number;
    method: TPaymentMethod;
    wallet?: string;
}

export interface ITopUpResponse {
    result: string;
    method: TPaymentMethod;
}
