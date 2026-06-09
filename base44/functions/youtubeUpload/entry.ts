import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { access_token, video_url, title, description, tags, privacy_status } = await req.json();

    if (!access_token || !video_url || !title) {
      return Response.json({ error: 'access_token, video_url, and title are required' }, { status: 400 });
    }

    // Fetch the video file from the URL
    const videoRes = await fetch(video_url);
    if (!videoRes.ok) return Response.json({ error: 'Failed to fetch video from URL' }, { status: 400 });
    const videoBuffer = await videoRes.arrayBuffer();

    // Step 1: Initiate resumable upload
    const metadata = {
      snippet: {
        title,
        description: description || '',
        tags: tags || [],
        categoryId: '22',
      },
      status: {
        privacyStatus: privacy_status || 'private',
      },
    };

    const initRes = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/*',
          'X-Upload-Content-Length': videoBuffer.byteLength.toString(),
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!initRes.ok) {
      const err = await initRes.json();
      return Response.json({ error: err?.error?.message || 'Failed to initiate upload' }, { status: 400 });
    }

    const uploadUrl = initRes.headers.get('Location');
    if (!uploadUrl) return Response.json({ error: 'No upload URL returned' }, { status: 500 });

    // Step 2: Upload the video
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/*',
        'Content-Length': videoBuffer.byteLength.toString(),
      },
      body: videoBuffer,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      return Response.json({ error: err?.error?.message || 'Upload failed' }, { status: 400 });
    }

    const video = await uploadRes.json();
    return Response.json({
      success: true,
      video_id: video.id,
      youtube_url: `https://www.youtube.com/watch?v=${video.id}`,
      title: video.snippet?.title,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});