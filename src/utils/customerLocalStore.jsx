export const resetCustomersLocal = (customers) => {
  if (!Array.isArray(customers)) return;
  const formatted = customers
    .filter((c) => (c.phone_number || c.phone))
    .map((c) => ({
      name: c.name || c.full_name || c.customer_name,
      phone: String(c.phone_number || c.phone).replace(/\D/g, ""),
    }));

  localStorage.setItem("customers_local", JSON.stringify(formatted));
};

export const appendCustomerLocal = (name, phone) => {
  const customers =
    JSON.parse(localStorage.getItem("customers_local")) || [];

  const cleanPhone = String(phone).replace(/\D/g, "");

  if (cleanPhone && !customers.some((c) => c.phone === cleanPhone)) {
    customers.push({ name, phone: cleanPhone });
    localStorage.setItem("customers_local", JSON.stringify(customers));
  }
};
