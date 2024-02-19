import React from 'react'
import { getSettings } from "../models/settings.server";
import { json, useLoaderData } from '@remix-run/react';
import db from "../db.server";
import { debug } from '~/utils/debug';

export async function loader() {    
    return await getSettings(1)
}

interface Props{}

export default function Settings(props: Props) {
    const {} = props
    const loaderData = useLoaderData<typeof loader>();

    let isCustomDescription = loaderData?.isCustomDescription ? "yes, use custom description" : "no, don't use custom description"
    
    return (
        <div>
            <h3>SETTINGS!!</h3>
            <div>
                <p>
                    use Custom description? 
                </p>
                <div>
                    - {isCustomDescription}
                </div>
            </div>
        </div>
    )
}
