/**
 * Vector utility for dynamic phone number management.
 * This file replaces hardcoded storage and localStorage with a memory-managed vector.
 */
import { searchCustomers } from "../api/customers";

let phoneVector = [];

/**
 * Normalizes a phone number by removing all non-digit characters.
 */
export const normalizePhone = (phone) => {
    if (!phone) return "";
    return String(phone).replace(/\D/g, "");
};

/**
 * Updates the internal memory vector with new customer data.
 * @param {Array} customers - Array of customer objects from API.
 */
export const updateVector = (customers) => {
    if (!Array.isArray(customers)) return;

    customers.forEach(c => {
        const phone = normalizePhone(c.phone_number || c.phone);
        if (phone && !phoneVector.some(v => v.phone === phone)) {
            phoneVector.push({
                id: String(c.id || ""),
                name: c.name || c.full_name || c.customer_name,
                phone: phone
            });
        }
    });
};

/**
 * Checks for a duplicate phone number using memory vector + API fallback.
 * This avoids hardcoding and localStorage while staying dynamic.
 */
export const checkDuplicate = async (phone, excludeId = null) => {
    const onlyDigits = normalizePhone(phone);
    if (!onlyDigits) return null;

    // 1. Check in-memory vector (exclude self when editing)
    const memMatch = phoneVector.find(v => {
        if (v.phone !== onlyDigits) return false;
        if (excludeId && String(v.id) === String(excludeId)) return false;
        return true;
    });
    if (memMatch) return memMatch;

    // 2. Dynamic API check
    try {
        const res = await searchCustomers(phone, "phone", { limit: 20 });
        if (res.success && res.data) {
            // Update vector with new results for future checks
            updateVector(res.data);

            const match = res.data.find(c => {
                const targetDigits = normalizePhone(c.phone_number);
                const isDifferentUser = excludeId ? String(c.id) !== String(excludeId) : true;
                return targetDigits === onlyDigits && isDifferentUser;
            });

            return match ? { name: match.name, phone: onlyDigits } : null;
        }
    } catch (err) {
        console.error("Vector API check failed:", err);
    }

    return null;
};

