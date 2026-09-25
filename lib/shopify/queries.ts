import { cartFragment, imageFragment, productCardFragment, productFragment } from "./fragments";

export const getProductQuery = /* GraphQL */ `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${productFragment}
`;

export const getProductsQuery = /* GraphQL */ `
  query getProducts($first: Int = 24, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
      nodes {
        ...productCard
      }
    }
  }
  ${productCardFragment}
`;

export const getProductHandlesQuery = /* GraphQL */ `
  query getProductHandles($first: Int = 250) {
    products(first: $first) {
      nodes {
        handle
        updatedAt
      }
    }
  }
`;

export const getCollectionQuery = /* GraphQL */ `
  query getCollection($handle: String!) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      updatedAt
      seo {
        title
        description
      }
      image {
        ...image
      }
    }
  }
  ${imageFragment}
`;

export const getCollectionsQuery = /* GraphQL */ `
  query getCollections {
    collections(first: 50, sortKey: TITLE) {
      nodes {
        id
        handle
        title
        description
        descriptionHtml
        updatedAt
        seo {
          title
          description
        }
        image {
          ...image
        }
      }
    }
  }
  ${imageFragment}
`;

export const getCollectionProductsQuery = /* GraphQL */ `
  query getCollectionProducts(
    $handle: String!
    $first: Int = 24
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      products(
        first: $first
        after: $after
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...productCard
        }
      }
    }
  }
  ${productCardFragment}
`;

export const getProductRecommendationsQuery = /* GraphQL */ `
  query getProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...productCard
    }
  }
  ${productCardFragment}
`;

export const predictiveSearchQuery = /* GraphQL */ `
  query predictiveSearch($query: String!) {
    predictiveSearch(query: $query, limit: 6, types: [PRODUCT, COLLECTION]) {
      queries {
        text
      }
      products {
        ...productCard
      }
      collections {
        handle
        title
      }
    }
  }
  ${productCardFragment}
`;

export const getMetaobjectsQuery = /* GraphQL */ `
  query getMetaobjects($type: String!, $first: Int = 10) {
    metaobjects(type: $type, first: $first) {
      nodes {
        id
        handle
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
  ${imageFragment}
`;

export const getPageQuery = /* GraphQL */ `
  query getPage($handle: String!) {
    page(handle: $handle) {
      id
      handle
      title
      body
      bodySummary
      seo {
        title
        description
      }
    }
  }
`;

export const getShopPoliciesQuery = /* GraphQL */ `
  query getShopPolicies {
    shop {
      name
      privacyPolicy {
        title
        handle
        body
        url
      }
      refundPolicy {
        title
        handle
        body
        url
      }
      shippingPolicy {
        title
        handle
        body
        url
      }
      termsOfService {
        title
        handle
        body
        url
      }
    }
  }
`;

export const getCartQuery = /* GraphQL */ `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...cart
    }
  }
  ${cartFragment}
`;

const articleCardFields = `
  id
  handle
  title
  excerpt
  publishedAt
  blog {
    handle
    title
  }
  image {
    url
    altText
    width
    height
  }
`;

export const getBlogQuery = /* GraphQL */ `
  query getBlog($handle: String!, $first: Int = 24) {
    blog(handle: $handle) {
      handle
      title
      seo {
        title
        description
      }
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        nodes {
          ${articleCardFields}
        }
      }
    }
  }
`;

export const getLatestArticlesQuery = /* GraphQL */ `
  query getLatestArticles($first: Int = 3) {
    articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
      nodes {
        ${articleCardFields}
      }
    }
  }
`;

export const getArticleQuery = /* GraphQL */ `
  query getArticle($blog: String!, $handle: String!) {
    blog(handle: $blog) {
      articleByHandle(handle: $handle) {
        ${articleCardFields}
        contentHtml
        tags
        authorV2 {
          name
        }
        seo {
          title
          description
        }
      }
    }
  }
`;

export const getBlogsQuery = /* GraphQL */ `
  query getBlogs {
    blogs(first: 10) {
      nodes {
        handle
        articles(first: 100) {
          nodes {
            handle
            publishedAt
          }
        }
      }
    }
  }
`;
