"use client";

interface VideoPlayerProps {
  url: string;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  const getEmbedUrl = (videoUrl: string): string | null => {
    if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
      const videoId = extractYouTubeId(videoUrl);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (videoUrl.includes("vimeo.com")) {
      const videoId = extractVimeoId(videoUrl);
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    return null;
  };

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const extractVimeoId = (url: string): string | null => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const embedUrl = getEmbedUrl(url);

  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <video src={url} controls className="w-full h-full">
      Your browser does not support the video tag.
    </video>
  );
}

