import { useState } from "react";

interface EventCardProps {
  title: string;
  date: string;
  description: string;
  media: Array<{ type: "image" | "video"; src: string }>;
}

export default function EventCard({ title, date, description, media }: EventCardProps) {
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md">
      {/* Header */}
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-sm text-gray-400 mt-1">{date}</p>

      {/* Description */}
      <p className="mt-4 text-gray-300">{description}</p>

      {/* Media List */}
      <div className="mt-6 flex gap-4 overflow-x-auto">
        {media.map((item, index) => (
          <MediaItem key={index} type={item.type} src={item.src} />
        ))}
      </div>
    </div>
  );
}

function MediaItem({ type, src }: { type: "image" | "video"; src: string }) {
  const [isLandscape, setIsLandscape] = useState(false);
  const [naturalWidth, setNaturalWidth] = useState(0);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setIsLandscape(naturalWidth > naturalHeight);
    setNaturalWidth(naturalWidth);
  };

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const { videoWidth, videoHeight } = e.currentTarget;
    setIsLandscape(videoWidth > videoHeight);
    setNaturalWidth(videoWidth);
  };

  return (
    <div
      className={`flex-shrink-0 overflow-hidden rounded-lg ${
        isLandscape ? "w-auto" : "w-64"
      }`}
      style={
        isLandscape
          ? { width: `${Math.min(naturalWidth, 800)}px`, maxWidth: "800px" } // Constrain width to a maximum of 800px
          : {}
      }
    >
      {type === "image" ? (
        <img
          src={src}
          alt="Event media"
          onLoad={handleImageLoad}
          className="w-full h-auto object-cover hover:scale-105 transition-transform max-h-[400px]"
        />
      ) : (
        <video
          src={src}
          controls
          onLoadedMetadata={handleVideoLoad}
          className="w-full h-auto object-cover max-h-[400px]"
        />
      )}
    </div>
  );
}