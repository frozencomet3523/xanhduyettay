const COUNTDOWN_STORAGE_KEY = 'capcut_pro_promo_end';
const COUNTDOWN_DURATION_MS = 24 * 60 * 60 * 1000;

export const formatCountdown = (remainingMs: number): string => {
    const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
};

export const getPromoCountdownEnd = (): number => {
    if (typeof window === 'undefined') {
        return Date.now() + COUNTDOWN_DURATION_MS;
    }

    try {
        const stored = localStorage.getItem(COUNTDOWN_STORAGE_KEY);
        const parsed = stored ? Number.parseInt(stored, 10) : Number.NaN;

        if (!Number.isNaN(parsed) && parsed > Date.now()) {
            return parsed;
        }

        const endTime = Date.now() + COUNTDOWN_DURATION_MS;
        localStorage.setItem(COUNTDOWN_STORAGE_KEY, String(endTime));
        return endTime;
    } catch {
        return Date.now() + COUNTDOWN_DURATION_MS;
    }
};

export const getPromoCountdownRemaining = (endTime: number): number => Math.max(0, endTime - Date.now());
