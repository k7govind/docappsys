export const sanitizeInput = (value) => {
    if (!value)
        return "";
    return value.trim();
};
