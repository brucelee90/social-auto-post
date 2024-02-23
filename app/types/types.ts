export interface PostMediaAttributes {
    id: string, 
    title: string, 
    description: string
    images: {
        nodes: [{
            url: string
        }]
    }
}