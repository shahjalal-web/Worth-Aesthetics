import { cartFragment } from "./fragments";

const userErrors = `
  userErrors {
    field
    message
  }
`;

export const createCartMutation = /* GraphQL */ `
  mutation createCart($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...cart
      }
      ${userErrors}
    }
  }
  ${cartFragment}
`;

export const addToCartMutation = /* GraphQL */ `
  mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
      ${userErrors}
    }
  }
  ${cartFragment}
`;

export const updateCartLinesMutation = /* GraphQL */ `
  mutation updateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...cart
      }
      ${userErrors}
    }
  }
  ${cartFragment}
`;

export const removeFromCartMutation = /* GraphQL */ `
  mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...cart
      }
      ${userErrors}
    }
  }
  ${cartFragment}
`;

export const updateCartNoteMutation = /* GraphQL */ `
  mutation updateCartNote($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
      cart {
        ...cart
      }
      ${userErrors}
    }
  }
  ${cartFragment}
`;

export const updateBuyerIdentityMutation = /* GraphQL */ `
  mutation updateBuyerIdentity($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
      }
      ${userErrors}
    }
  }
`;
