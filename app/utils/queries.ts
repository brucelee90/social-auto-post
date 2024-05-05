interface Queries {
  queryProductsById: string,
  queryProductWithPlacehoderFieldsById: string,
  queryAllProducts: string,
  queryAllDiscounts: string,
  getAllProducts: string
  getSingleProductById: string
  getAllCollections: string
}

export const queries: Queries = {
  queryProductsById: `
    #graphql
    query Products($ids: [ID!]!) {
        nodes(ids: $ids) {
        ... on Product {
            id
            title
            description
            images (first: 1){
                nodes {
                    url(transform: {maxHeight: 500, maxWidth: 500})
                    }
                }
            }
        }
    }`,

  queryProductWithPlacehoderFieldsById: `
  query ProductQuery($id: ID!) {
      product(id: $id) {
          id
          title
          description
          tags
          priceRangeV2 {
              minVariantPrice { amount, currencyCode }
              maxVariantPrice { amount, currencyCode }
          }
          compareAtPriceRange {
              minVariantCompareAtPrice { amount, currencyCode }
              maxVariantCompareAtPrice { amount, currencyCode }
          }
      }
  }
`,

  getSingleProductById: `
    query ProductQuery($id: ID!) {
        product(id: $id) {
            ${getProductFields()}
        }
    }
`,

  getAllProducts: `
    query products {
        products(first: 250, query: "status:active AND published_status:published") {
            nodes {
                ${getProductFields()}
            }
        }
    }
`,


  queryAllProducts: `
    #graphql
    query products {
        products (first:250, query:"status:active AND published_status:published") {
        nodes{
          description
          title
          id
          featuredImage{
            url
          }
          images (first: 10){
            nodes {
              url(transform: {maxHeight: 500, maxWidth: 500})
            }
          }
          tags
          priceRangeV2 {
              minVariantPrice { amount, currencyCode }
              maxVariantPrice { amount, currencyCode }
          }
          compareAtPriceRange {
              minVariantCompareAtPrice { amount, currencyCode }
              maxVariantCompareAtPrice { amount, currencyCode }
          }
        }
      }
    }
    `,
  queryAllDiscounts: `
    #graphql
    query ListDiscountCodes {
      codeDiscountNodes(first: 250) {
        nodes {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              summary
            }
          }
        }
      }
    }
    `,
  getAllCollections: `        
  query getAllCollections {
    collections(first: 250) {
    nodes{
      id
      title
    }
    }
  }
`,
}

function getProductFields(): string {
  return `
      description
      title
      id
      featuredImage {
          url
      }
      images(first: 10) {
          nodes {
              url(transform: {maxHeight: 500, maxWidth: 500})
          }
      }
      tags
      priceRangeV2 {
          minVariantPrice { amount, currencyCode }
          maxVariantPrice { amount, currencyCode }
      }
      compareAtPriceRange {
          minVariantCompareAtPrice { amount, currencyCode }
          maxVariantCompareAtPrice { amount, currencyCode }
      }
      collections(first: 250){
        nodes{
          id
          title
        }
      }
  `;
}
