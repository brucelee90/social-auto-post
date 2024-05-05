import { useSubmit } from '@remix-run/react';
import { MediaQueueItemProps } from './types';
import { useState } from 'react';
import { Modal } from '@shopify/polaris';

export function MediaQueueItem(props: MediaQueueItemProps) {
    const { id, imgSrcUrl, description, title, isItemRemoving, isFailedDeletion } = props;

    return (
        <>
            {isItemRemoving ? (
                `${title} Removed from queue successfully`
            ) : (
                <div>
                    {isFailedDeletion && (
                        <dialog open>
                            <p>Deletion Failed for this item!</p>
                            <form method="dialog">
                                <button>OK</button>
                            </form>
                        </dialog>
                    )}
                    <div style={{ display: `${isItemRemoving && 'none'}` }}>
                        <input type="hidden" name="id" value={id} />
                        <input type="hidden" name="imgSrcUrl" value={imgSrcUrl} />
                        <input type="hidden" name="description" value={description} />
                        <p>title: {title}</p>
                        <div style={{ display: 'flex' }}>
                            <img src={imgSrcUrl} alt={title} />
                            <p>description: {description}</p>
                        </div>
                        <button name="post" value="post" type="submit">
                            {isFailedDeletion ? 'Retry Posting' : 'Post now'}
                        </button>
                        <button name="remove" value="remove" type="submit">
                            {isFailedDeletion ? 'Retry Removing Item' : 'Remove Item'}
                        </button>
                        <hr />
                    </div>
                </div>
            )}
        </>
    );
}
