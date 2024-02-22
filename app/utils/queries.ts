interface Queries {
    queryProductsById: string
}

export const queries : Queries =  {
    queryProductsById:  `
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
    }
`
}

