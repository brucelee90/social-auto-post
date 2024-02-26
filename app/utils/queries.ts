interface Queries {
    queryProductsById: string,
    queryAllProducts: string
}

export const queries : Queries =  {
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
    queryAllProducts: `
    #graphql
    query products {
        products (first:50, query:"status:active AND published_status:published") {
        nodes{
          description
          title
          id
          featuredImage{
            url
          }
        }
      }
    }
    `
}

