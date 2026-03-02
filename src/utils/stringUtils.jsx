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

export const capitalizeEachWord = (str) => {
    if (!str) return str;

    return str
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const formatTitleCaseAlphanumeric = (str) => {
    if (!str) return str;
    // Remove non-alphanumeric except spaces
    const clean = str.replace(/[^a-zA-Z0-9\s]/g, '');
    // Capitalize first letter and after each space, preserve multiple spaces until final submission if needed, 
    // but usually we want to collapse them. User requested "no multiple space to capture".
    return clean
        .split(/(\s+)/)
        .map(part => part.match(/\s+/) ? ' ' : (part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()))
        .join('')
        .replace(/\s+/g, ' '); // Collapse multiple spaces
};

export const formatPositiveNumeric = (str) => {
    if (!str) return str;
    // Allow only digits and one optional decimal point, no negative sign
    let clean = str.replace(/[^-0-9.]/g, ''); // Keep numbers and dot
    clean = clean.replace(/-/g, ''); // Remove all minus signs
    const parts = clean.split('.');
    if (parts.length > 2) {
        return parts[0] + '.' + parts.slice(1).join('');
    }
    return clean;
};

