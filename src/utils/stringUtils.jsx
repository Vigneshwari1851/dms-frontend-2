export const capitalizeFirstLetter = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};
export const capitalizeWords = (str) => {
    if (!str) return str;
    return str.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
};

export const onlyAlphabets = (str) => {
    return str.replace(/[^a-zA-Z\s]/g, '');
};

export const onlyNumbers = (str) => {
    return str.replace(/[^0-9]/g, '');
};

export const formatPhoneNumber = (str) => {
    const hasPlus = str.startsWith('+');
    const digits = str.replace(/[^0-9]/g, '').slice(0, 15);
    return (hasPlus ? '+' : '') + digits;
};

export const onlyAlphanumeric = (str) => {
    return str.replace(/[^a-zA-Z0-9]/g, '');
};
