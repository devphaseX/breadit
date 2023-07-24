import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
  const resourceURL = new URL(req.url);
  const previewRequestedURL = resourceURL.searchParams.get('url');

  if (!previewRequestedURL) {
    return new NextResponse('Invalid href', { status: 400 });
  }

  const previewURLResponse = await axios.get(previewRequestedURL);

  if (previewURLResponse.status !== 200) {
    return new NextResponse('Sorry cannot preview link', { status: 403 });
  }

  const previewURLTitle = (
    previewURLResponse.data as string | undefined
  )?.match(/<title.*?>\s*(.*?)\s*<\/title>/)?.[1];

  const previewURLDescription = (
    previewURLResponse.data as string | undefined
  )?.match(/\<meta (?=.*?name="description")(?=.*?content="(.*?)")/)?.[1];

  const previewURLImage = (
    previewURLResponse.data as string | undefined
  )?.match(/\<meta (?=.*?property="og:image")(?=.*?content="(.*?)")/)?.[1];

  return new NextResponse(
    JSON.stringify({
      success: 1,
      meta: {
        title: previewURLTitle,
        description: previewURLDescription,
        image: {
          url: previewURLImage,
        },
      },
    })
  );
};
