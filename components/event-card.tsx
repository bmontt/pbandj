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
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item, index) => (
          <MediaItem key={index} type={item.type} src={item.src} />
        ))}
      </div>
    </div>
  );
}

function MediaItem({ type, src }: { type: "image" | "video"; src: string }) {
  const [isLandscape, setIsLandscape] = useState(false);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setIsLandscape(naturalWidth > naturalHeight);
  };

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const { videoWidth, videoHeight } = e.currentTarget;
    setIsLandscape(videoWidth > videoHeight);
  };

  return (
    <div
      className={`overflow-hidden rounded-lg ${
        isLandscape ? "col-span-2 row-span-2" : ""
      }`}
    >
      {type === "image" ? (
        <img
          src={src}
          alt="Event media"
          onLoad={handleImageLoad}
          className={`w-full h-auto object-cover hover:scale-105 transition-transform ${
            isLandscape ? "max-h-[500px]" : "max-h-[400px]"
          }`}
        />
      ) : (
        <video
          src={src}
          controls
          onLoadedMetadata={handleVideoLoad}
          className={`w-full h-auto object-cover ${
            isLandscape ? "max-h-[500px]" : "max-h-[400px]"
          }`}
        />
      )}
    </div>
  );
}