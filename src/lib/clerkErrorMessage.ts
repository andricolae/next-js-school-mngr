export const clerkErrorTranslations: Record<string, string> = {
    form_password_incorrect: "Parola introdusă este incorectă",
    form_identifier_not_found: "Nu există un cont asociat cu acest nume de utilizator",
    form_identifier_exists: "Există deja un cont cu acest nume de utilizator",
    form_param_format_invalid: "Numele de utilizator introdus este invalid",
    form_password_length_too_short: "Parola trebuie să aibă cel puțin 8 caractere",
    form_username_invalid_character: "Numele de utilizator conține caractere invalide",
};

export function translateClerkError(code: string, fallback: string) {
    return clerkErrorTranslations[code] || fallback;
}
