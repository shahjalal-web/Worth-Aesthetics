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
  { namespace: "worth", key: "subtitle" }
  { namespace: "worth", key: "active_complex" }
  { namespace: "worth", key: "size_label" }
  { namespace: "worth", key: "badge" }
  { namespace: "worth", key: "skin_concerns" }
  { namespace: "worth", key: "skin_types" }
  { namespace: "worth", key: "routine_step" }
]`;

/** Minimal product data for cards / rails / upsells. */
export const productCardFragment = /* GraphQL */ `
  fragment productCard on Product {
    id
    handle
    title
    productType
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
        { namespace: "worth", key: "benefits" }
        { namespace: "worth", key: "results_claims" }
        { namespace: "worth", key: "how_to_use" }
        { namespace: "worth", key: "full_ingredients_inci" }
      ]
    ) {
      key
      value
    }
    keyIngredients: metafield(namespace: "worth", key: "key_ingredients") {
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
    faq: metafield(namespace: "worth", key: "faq") {
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
    pairsWellWith: metafield(namespace: "worth", key: "pairs_well_with") {
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
              productType
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
