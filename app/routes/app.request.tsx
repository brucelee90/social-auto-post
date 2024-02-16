import {  GetPageInfoRequest, PageField} from 'instagram-graph-api';
import { useLoaderData } from '@remix-run/react';

interface Props {}


export async function loader() {

    try {    
        if (process.env.ACCESS_TOKEN && process.env.PAGE_ID != undefined) {
            let request : GetPageInfoRequest = new GetPageInfoRequest(process.env.ACCESS_TOKEN, process.env.PAGE_ID, ...[PageField.FOLLOWERS_COUNT, PageField.FOLLOWS_COUNT, PageField.MEDIA_COUNT, PageField.NAME, PageField.USERNAME ] );
            return  ((await request.execute()).getData());
        }
    } catch (error) {
        throw new Error("ACCESS TOKEN UND PAGE ID ÜBRERPRÜFEN!");        
    }
}


function Request(props: Props) {
    const ig_res  = useLoaderData<typeof loader>();
    return (
        <div>
            <div>{ig_res.username} hat</div>
            <ul>
                <li>{ig_res.followers_count} Follower</li>
                <li>{ig_res.follows_count} Follows</li>
                <li>{ig_res.media_count} Bilder hochgeladen</li>
            </ul>
        </div>
    )
}

export default Request


