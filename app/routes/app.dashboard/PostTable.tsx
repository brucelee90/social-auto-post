import { IndexTable, LegacyCard, Text, Badge, useBreakpoints, Card } from '@shopify/polaris';
import React from 'react';

interface Post {
    id: string;
    description: string;
    scheduleDate: string;
    postStatus: any;
    imgUrl: string;
}

interface Props {
    posts: Post[];
}

export function PostTable(props: Props) {
    const { posts } = props;

    const postss = [
        {
            id: '1020',
            description: 'Post Example Description',
            scheduleDate: 'May 20 at 4:34pm',
            postStatus: (
                <Badge progress="complete" tone="success">
                    Posted
                </Badge>
            )
        },
        {
            id: '1019',

            description: 'Post Example Description',
            scheduleDate: 'Jul 20 at 4:34pm',
            postStatus: (
                <Badge progress="partiallyComplete" tone="warning">
                    Scheduled
                </Badge>
            )
        },
        {
            id: '1018',
            description: 'Post Example Description',
            scheduleDate: 'Jun 20 at 3.44pm',
            postStatus: (
                <Badge progress="complete" tone="success">
                    Posted
                </Badge>
            )
        }
    ];
    const resourceName = {
        singular: 'order',
        plural: 'orders'
    };

    const rowMarkup = posts.map(({ id, description, scheduleDate, postStatus, imgUrl }, index) => (
        <IndexTable.Row id={id} key={id} position={index}>
            <IndexTable.Cell>
                <img src={imgUrl} width="150" />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <span style={{ whiteSpace: 'pre-line' }}>{description}</span>
            </IndexTable.Cell>
            <IndexTable.Cell>{postStatus}</IndexTable.Cell>
            <IndexTable.Cell>{scheduleDate}</IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <Card>
            <IndexTable
                condensed={useBreakpoints().smDown}
                resourceName={resourceName}
                itemCount={posts.length}
                headings={[
                    { title: 'Image' },
                    { title: 'Caption' },
                    { title: 'Post Date' },
                    { title: 'Planned for' }
                ]}
                selectable={false}
            >
                {rowMarkup}
            </IndexTable>
        </Card>
    );
}
