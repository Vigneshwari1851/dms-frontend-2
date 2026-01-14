export const resetCustomersLocal = (customers) => {
    const formatted = customers
        .filter((c) => c.phone_number || c.phone)
        .map((c) => ({
            name: c.name || c.full_name || c.customer_name,
            phone: String(c.phone_number || c.phone).replace(/\D/g, ""),
        }));

    localStorage.setItem("customers_local", JSON.stringify(formatted));
};