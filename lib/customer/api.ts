import "server-only";
import { clearSession, getEndpoints, getSession, refreshSession, saveSession, type CustomerSession } from "./auth";

export class NotAuthenticatedError extends Error {}

/**
 * Customer Account API GraphQL fetch. Refreshes an expired access token when
 * possible. Must be called from a Server Action / Route Handler if a refresh
 * needs to persist; in Server Components the refreshed token is used for this
 * request only (cookies are read-only there).
 */
export async function customerFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  let session: CustomerSession | undefined = await getSession();
  if (!session) throw new NotAuthenticatedError();

  if (Date.now() > session.expiresAt) {
    session = await refreshSession(session);
    if (!session) throw new NotAuthenticatedError();
    try {
      await saveSession(session);
    } catch {
      /* read-only cookies in Server Components — fine */
    }
  }

  const { graphql } = await getEndpoints();
  const res = await fetch(graphql, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: session.accessToken },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (res.status === 401) {
    try {
      await clearSession();
    } catch {
      /* read-only */
    }
    throw new NotAuthenticatedError();
  }
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data as T;
}

/* ------------------------------------------------------------------ */
/* Queries                                                            */
/* ------------------------------------------------------------------ */
const money = `amount currencyCode`;

const addressFields = `
  id
  formatted
  firstName
  lastName
  company
  address1
  address2
  city
  zoneCode
  territoryCode
  zip
  phoneNumber
`;

export const CUSTOMER_QUERY = /* GraphQL */ `
  query customer {
    customer {
      id
      firstName
      lastName
      emailAddress { emailAddress }
      defaultAddress { ${addressFields} }
      addresses(first: 20) { nodes { ${addressFields} } }
      orders(first: 5, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          totalPrice { ${money} }
          fulfillments(first: 1) { nodes { status } }
          lineItems(first: 4) { nodes { title image { url altText } } }
        }
      }
    }
  }
`;

export const ORDERS_QUERY = /* GraphQL */ `
  query orders($after: String) {
    customer {
      orders(first: 20, after: $after, sortKey: PROCESSED_AT, reverse: true) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          name
          processedAt
          financialStatus
          totalPrice { ${money} }
          fulfillments(first: 1) { nodes { status } }
          lineItems(first: 4) { nodes { title image { url altText } } }
        }
      }
    }
  }
`;

export const ORDER_QUERY = /* GraphQL */ `
  query order($id: ID!) {
    order(id: $id) {
      id
      name
      processedAt
      financialStatus
      statusPageUrl
      cancelledAt
      subtotal { ${money} }
      totalTax { ${money} }
      totalShipping { ${money} }
      totalPrice { ${money} }
      shippingAddress { name formatted(withName: false) }
      fulfillments(first: 10) {
        nodes {
          status
          trackingInformation { company number url }
        }
      }
      lineItems(first: 100) {
        nodes {
          id
          title
          variantTitle
          quantity
          price { ${money} }
          totalPrice { ${money} }
          image { url altText }
        }
      }
    }
  }
`;

export const CUSTOMER_UPDATE = /* GraphQL */ `
  mutation customerUpdate($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer { firstName lastName }
      userErrors { field message }
    }
  }
`;

export const ADDRESS_CREATE = /* GraphQL */ `
  mutation addressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress { id }
      userErrors { field message }
    }
  }
`;

export const ADDRESS_UPDATE = /* GraphQL */ `
  mutation addressUpdate($addressId: ID!, $address: CustomerAddressInput, $defaultAddress: Boolean) {
    customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) {
      customerAddress { id }
      userErrors { field message }
    }
  }
`;

export const ADDRESS_DELETE = /* GraphQL */ `
  mutation addressDelete($addressId: ID!) {
    customerAddressDelete(addressId: $addressId) {
      deletedAddressId
      userErrors { field message }
    }
  }
`;

/* Types */
type M = { amount: string; currencyCode: string };

export type CustomerAddress = {
  id: string;
  formatted: string[];
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  zoneCode: string | null;
  territoryCode: string | null;
  zip: string | null;
  phoneNumber: string | null;
};

export type OrderSummary = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  totalPrice: M;
  fulfillments: { nodes: { status: string }[] };
  lineItems: { nodes: { title: string; image: { url: string; altText: string | null } | null }[] };
};

export type Customer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddress: { emailAddress: string } | null;
  defaultAddress: CustomerAddress | null;
  addresses: { nodes: CustomerAddress[] };
  orders: { nodes: OrderSummary[] };
};

export type OrderDetail = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string | null;
  statusPageUrl: string;
  cancelledAt: string | null;
  subtotal: M | null;
  totalTax: M | null;
  totalShipping: M | null;
  totalPrice: M;
  shippingAddress: { name: string | null; formatted: string[] } | null;
  fulfillments: { nodes: { status: string; trackingInformation: { company: string | null; number: string | null; url: string | null }[] }[] };
  lineItems: {
    nodes: {
      id: string;
      title: string;
      variantTitle: string | null;
      quantity: number;
      price: M | null;
      totalPrice: M | null;
      image: { url: string; altText: string | null } | null;
    }[];
  };
};
