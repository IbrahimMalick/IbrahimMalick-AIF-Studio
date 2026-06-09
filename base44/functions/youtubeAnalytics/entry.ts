import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { access_token } = await req.json();
    if (!access_token) return Response.json({ error: 'access_token is required' }, { status: 400 });

    // Fetch channel info
    const channelRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const channelData = await channelRes.json();
    const channel = channelData.items?.[0];

    if (!channel) return Response.json({ error: 'No channel found' }, { status: 404 });

    // Fetch recent videos
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel.id}&order=date&maxResults=10&type=video`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const videosData = await videosRes.json();
    const videoIds = videosData.items?.map(v => v.id?.videoId).filter(Boolean).join(',');

    let videoStats = [];
    if (videoIds) {
      const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      const statsData = await statsRes.json();
      videoStats = statsData.items?.map(v => ({
        id: v.id,
        title: v.snippet?.title,
        published_at: v.snippet?.publishedAt,
        thumbnail: v.snippet?.thumbnails?.medium?.url,
        views: parseInt(v.statistics?.viewCount || 0),
        likes: parseInt(v.statistics?.likeCount || 0),
        comments: parseInt(v.statistics?.commentCount || 0),
      })) || [];
    }

    return Response.json({
      channel: {
        id: channel.id,
        name: channel.snippet?.title,
        description: channel.snippet?.description,
        thumbnail: channel.snippet?.thumbnails?.medium?.url,
        subscribers: parseInt(channel.statistics?.subscriberCount || 0),
        total_views: parseInt(channel.statistics?.viewCount || 0),
        video_count: parseInt(channel.statistics?.videoCount || 0),
      },
      recent_videos: videoStats,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});