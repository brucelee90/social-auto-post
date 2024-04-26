import { Text } from '@shopify/polaris';
import React from 'react';
import { ActionFunctionArgs } from '@remix-run/node';
import { Form } from '@remix-run/react';

interface Props {}

export const action = async ({ request }: ActionFunctionArgs) => {};

function Route(props: Props) {
    const {} = props;

    return (
        <div>
            <Text as="h1" variant="headingLg">
                Campaigns
            </Text>

            <Form method="post">
                <button>Create new Campaign</button>
            </Form>
        </div>
    );
}

export default Route;
