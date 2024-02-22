import { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react';
import React from 'react'
import { json } from 'stream/consumers';
import { getMediaQueue } from '~/models/mediaqueue.server';
import { authenticate } from '~/shopify.server';
import { PostMediaAttributes } from '~/types/types';
import { queries } from '~/utils/queries';



export async function loader({request}: LoaderFunctionArgs) {
    const { session, admin } = await authenticate.admin(request);
    const { shop } = session;

    try {
        let mediaQueue  = await getMediaQueue(shop)
        let mediaQueueIds : string[] = []

        mediaQueue.map((e : any) => {
            mediaQueueIds.push(`gid://shopify/Product/${e?.productId}`)
        })
        
        const response = await admin.graphql(
            `${queries.queryProductsById}`,
            {
              variables: {
                "ids": mediaQueueIds
              },
            }
          );

          let responseJson = await response.json();

          console.log("responseJson:", responseJson);
          
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
                postMediaQueue.map((e : PostMediaAttributes) => {
                    return (
                        <div>
                            <p>title: {e.title}</p>
                            <p>description: {e.description}</p>
                            <button>Post now</button>
                            <hr />
                        </div>
                    )
                } )
            }

        </div>
    )
}

