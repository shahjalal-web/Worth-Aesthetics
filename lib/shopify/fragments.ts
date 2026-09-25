/* GraphQL fragments shared across queries and mutations. */

export const imageFragment = /* GraphQL */ `
  fragment image on Image {
    url
    altText
    width
    height
  }
`;

const cardMetafieldIds = `[
  { namespace: "wa", key: "subtitle" }
  { namespace: "wa", key: "active_complex" }
  { namespace: "wa", key: "size_label" }
  { namespace: "wa", key: "badge" }
]`;

/** Minimal product data for cards / rails / upsells. */
export const productCardFragment = /* GraphQL */ `
  fragment productCard on Product {
    id
    handle
    title
    availableForSale
    tags
    options {
      id
      name
      optionValues {
        name
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      ...image
    }
    images(first: 2) {
      nodes {
        ...image
      }
    }
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale
        selectedOptions {
          name
          value
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        image {
          ...image
        }
      }
    }
    cardMeta: metafields(identifiers: ${cardMetafieldIds}) {
      key
      value
    }
  }
  ${imageFragment}
`;

/** Full product data for the PDP. */
export const productFragment = /* GraphQL */ `
  fragment product on Product {
    ...productCard
    vendor
    productType
    description
    descriptionHtml
    updatedAt
    seo {
      title
      description
    }
    gallery: images(first: 20) {
      nodes {
        ...image
      }
    }
    allVariants: variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        selectedOptions {
          name
          value
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        image {
          ...image
        }
      }
    }
    detailMeta: metafields(
      identifiers: [
        { namespace: "wa", key: "routine_step" }
        { namespace: "wa", key: "benefits" }
        { namespace: "wa", key: "skin_concerns" }
        { namespace: "wa", key: "skin_types" }
        { namespace: "wa", key: "results_claims" }
        { namespace: "wa", key: "how_to_use" }
        { namespace: "wa", key: "full_ingredients_inci" }
      ]
    ) {
      key
      value
    }
    keyIngredients: metafield(namespace: "wa", key: "key_ingredients") {
      references(first: 12) {
        nodes {
          ... on Metaobject {
            fields {
              key
              value
              reference {
                ... on MediaImage {
                  image {
                    ...image
                  }
                }
              }
            }
          }
        }
      }
    }
    faq: metafield(namespace: "wa", key: "faq") {
      references(first: 20) {
        nodes {
          ... on Metaobject {
            fields {
              key
              value
            }
          }
        }
      }
    }
    pairsWellWith: metafield(namespace: "wa", key: "pairs_well_with") {
      references(first: 6) {
        nodes {
          ... on Product {
            ...productCard
          }
        }
      }
    }
  }
  ${productCardFragment}
`;

export const cartFragment = /* GraphQL */ `
  fragment cart on Cart {
    id
    checkoutUrl
    note
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      totalTaxAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
          compareAtAmountPerQuantity {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            selectedOptions {
              name
              value
            }
            image {
              ...image
            }
            product {
              id
              handle
              title
              featuredImage {
                ...image
              }
            }
          }
        }
      }
    }
  }
  ${imageFragment}
`;
