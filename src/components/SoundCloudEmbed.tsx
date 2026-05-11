interface SoundCloudEmbedProps {
  url: string;
  compact?: boolean;
}

export function SoundCloudEmbed({ url, compact = false }: SoundCloudEmbedProps) {
  // SoundCloud aceptará la URL del track o set y la transformará en su widget
  const params = new URLSearchParams({
    url,
    color: "#000000",
    auto_play: "false",
    hide_related: "true",
    show_comments: "false",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "false",
    visual: "false",
  });

  const src = `https://w.soundcloud.com/player/?${params.toString()}`;
  const height = compact ? 120 : 166;

  return (
    <iframe
      title="Reproductor de SoundCloud"
      src={src}
      width="100%"
      height={height}
      scrolling="no"
      allow="autoplay"
      loading="lazy"
      style={{ border: "none", display: "block", maxWidth: "100%" }}
      className="my-6"
    />
  );
}
