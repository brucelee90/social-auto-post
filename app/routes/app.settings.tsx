import { useState } from 'react';
import { getSettings, postSettings } from '../controllers/settings.server';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { authenticate } from '~/shopify.server';
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
    const { session } = await authenticate.admin(request);
    const { shop } = session;

    try {
        return await getSettings(shop);
    } catch (error) {
        throw new Error('Could not get settings');
    }
}

export async function action({ request }: ActionFunctionArgs) {
    const { session } = await authenticate.admin(request);
    const { shop } = session;

    const formData = await request.formData();
    let customDescription = formData.get('customDescription') as string;
    let iscustomDescription = customDescription === 'on';

    try {
        postSettings(shop, iscustomDescription);
    } catch (error) {
        throw new Error('Could not get settings');
    }
    return 'Settings Saved!';
}

interface Props {}

export default function Settings(props: Props) {
    const {} = props;
    const loaderData = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();

    const [checked, setChecked] = useState(loaderData?.isCustomDescription === (true as boolean));

    const handleChange = (e: any) => {
        setChecked(e.target.checked);
    };

    return (
        <div>
            <h3>SETTINGS!!</h3>

            <Form method="post">
                <div>
                    <input
                        type="checkbox"
                        name="customDescription"
                        checked={checked}
                        onChange={handleChange}
                    />
                    <label htmlFor="customDescription">Use Custom Description?</label>
                </div>

                <button type="submit">Save Settings</button>
                {actionData && <div>{actionData}</div>}
            </Form>
        </div>
    );
}
