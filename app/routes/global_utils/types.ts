// Add enums for Form action here
export type ProductInfo = {
    id: string;
    featuredImage: { url: string };
    title: string;
    description: string;
    images: { nodes: [{ url: string }] };
};