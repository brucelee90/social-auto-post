import { GetPageInfoRequest, PageField } from 'instagram-graph-api';
import { useLoaderData } from '@remix-run/react';

interface IgRes {
  error: boolean;
  message: string;
  username: string;
  followers_count: string;
  follows_count: string;
  media_count: string;
}

export async function loader() {
  try {
    if (process.env.ACCESS_TOKEN && process.env.PAGE_ID != undefined) {
      const request: GetPageInfoRequest = new GetPageInfoRequest(
        process.env.ACCESS_TOKEN,
        process.env.PAGE_ID,
        ...[
          PageField.FOLLOWERS_COUNT,
          PageField.FOLLOWS_COUNT,
          PageField.MEDIA_COUNT,
          PageField.NAME,
          PageField.USERNAME
        ]
      );
      return {
        error: false,
        message: 'Could not get Page Information',
        data: (await request.execute()).getData()
      };
    }
    throw new Error('ACCESS TOKEN UND PAGE ID ÜBRERPRÜFEN!');
  } catch (error) {
    console.log('Something went wrong');
    return { error: true, message: 'Could not get Page Information', data: null };
  }
}

function Request() {
  const loaderData = useLoaderData<typeof loader>();
  let ig_res: IgRes = JSON.parse(JSON.stringify(loaderData));

  return (
    <div>
      {ig_res.error ? (
        <div>{ig_res.message}</div>
      ) : (
        <>
          <div>{ig_res?.username} hat</div>
          <ul>
            <li>{ig_res?.followers_count} Follower</li>
            <li>{ig_res?.follows_count} Follows</li>
            <li>{ig_res?.media_count} Bilder hochgeladen</li>
          </ul>
        </>
      )}
    </div>
  );
}

export default Request;
