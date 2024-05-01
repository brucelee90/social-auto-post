interface Queries {
  queryProductsById: string,
  queryProductWithPlacehoderFieldsById: string,
  queryAllProducts: string,
  queryAllDiscounts: string,

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
}

