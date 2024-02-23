import { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react';
import { getMediaQueue } from '~/models/mediaqueue.server';
import { authenticate } from '~/shopify.server';
import { PostMediaAttributes } from '~/types/types';
import { queries } from '~/utils/queries';

export async function loader({request}: LoaderFunctionArgs) {
    const { session, admin } = await authenticate.admin(request);
    const { shop } = session;

    try {
        const mediaQueueIds : string[] = []
        const mediaQueue  = await getMediaQueue(shop)

        mediaQueue.map((e : any) => {
            mediaQueueIds.push(`gid://shopify/Product/${e?.productId}`)
        })
        
        const response = await admin.graphql(
            `${queries.queryProductsById}`,
            {variables: {"ids": mediaQueueIds},}
        );

        const responseJson = await response.json();
  
        if (responseJson) {            
            return responseJson
        } else {
            throw new Error()
        }
    } catch (error) {
        return "Media couldn't be fetched"
    }
}

interface Props {}

export default function Mediaqueue(props: Props) {
    const {} = props
    const loaderData = useLoaderData<typeof loader>();
    let json;
    let postMediaQueue : [PostMediaAttributes];

    try {
        json =  JSON.parse( JSON.stringify(loaderData) )    
    } catch (error) {
        console.log('Couldnt create JSON');
    }

    postMediaQueue = json?.data?.nodes

    return (
        <div>
            <h1>Media Queue</h1>
            {postMediaQueue?.length &&
                postMediaQueue.map((e : PostMediaAttributes , key) => {
                    
                    return (
                        <div key={key}>
                            <p>title: {e.title}</p>
                            <div style={{display: "flex"} }>
                                <img src={e.images.nodes[0].url} alt={e.title} />
                                <p>description: {e.description}</p>
                            </div>
                            <button>Post now</button>
                            <hr />
                        </div>
                    )
                    
                })
            }
        </div>
    )
}

