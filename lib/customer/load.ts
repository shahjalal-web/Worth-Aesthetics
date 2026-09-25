import "server-only";
import { CUSTOMER_QUERY, customerFetch, NotAuthenticatedError, type Customer } from "./api";
import { getSession, isCustomerAccountConfigured } from "./auth";

/** Returns the signed-in customer, or null when signed out / not configured. */
export async function loadCustomer(): Promise<Customer | null> {
  if (!isCustomerAccountConfigured() || !(await getSession())) return null;
  try {
    return (await customerFetch<{ customer: Customer }>(CUSTOMER_QUERY)).customer;
  } catch (e) {
    if (e instanceof NotAuthenticatedError) return null;
    throw e;
  }
}
