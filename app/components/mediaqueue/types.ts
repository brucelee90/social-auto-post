export interface MediaQueueItemProps {
    id: string;
    imgSrcUrl: string;
    description: string;
    title: string;
    isItemRemoving: boolean;
    isFailedDeletion: boolean
}