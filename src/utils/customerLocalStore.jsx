import { hashValue } from "./hash";

export const resetCustomersLocal = async (customers) => {
  const formatted = await Promise.all(
    customers
      .filter((c) => c.phone_number || c.phone)
      .map(async (c) => ({
        name: c.name || c.full_name || c.customer_name,
        phoneHash: await hashValue(
          String(c.phone_number || c.phone).replace(/\D/g, "")
        ),
      }))
  );

  localStorage.setItem("customers_local", JSON.stringify(formatted));
};

export const appendCustomerLocal = async (name, phone) => {
  const customers =
    JSON.parse(localStorage.getItem("customers_local")) || [];

  const phoneHash = await hashValue(phone);

  if (!customers.some((c) => c.phoneHash === phoneHash)) {
    customers.push({ name, phoneHash });
    localStorage.setItem("customers_local", JSON.stringify(customers));
  }
};
