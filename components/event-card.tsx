import { useState, useRef } from "react";
import { motion } from "framer-motion";

interface EventCardProps {
  title: string;
  date: string;
  description: string;
  media: Array<{ type: "image" | "video"; src: string }>;
  isRightAligned?: boolean;
}

export default function EventCard({ title, date, description, media, isRightAligned = false }: EventCardProps) {
  return (
    <motion.div 
      className="bg-black/40 text-white p-4 sm:p-6 md:p-8 rounded-sm shadow-lg transition-all duration-300 glow-yellow-sm"
      whileHover={{ opacity: 0.9 }}
      style={{ 
        width: 'fit-content',
        marginLeft: isRightAligned ? 'auto' : '0'
      }}
    >
      {/* Header */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-white/95 break-words">{title}</h2>
      <p className="text-xs sm:text-sm text-gray-400/80 mt-2 break-words">{date}</p>

      {/* Description */}
      <p className="mt-4 text-sm sm:text-base text-gray-300/90 font-light leading-relaxed break-words">{description}</p>

      {/* Media List */}
      <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
        {media.map((item, index) => (
          item.src ? <MediaItem key={index} type={item.type} src={item.src} /> : null
        ))}
      </div>
    </motion.div>
  );
}

function MediaItem({ type, src }: { type: "image" | "video"; src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
  };

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setIsLoading(false);
    const videoElement = e.currentTarget;
    const hasVideo = videoElement.videoWidth > 0 && videoElement.videoHeight > 0;
    if (!hasVideo) {
      setVideoError(true);
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video error:", e);
    setVideoError(true);
    setIsLoading(false);
  };

  const handleMouseEnter = () => {
    if (videoRef.current && !videoError) {
      videoRef.current.play().catch(err => console.log("Video play failed:", err));
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Don't render audio-only videos
  if (type === "video" && videoError) {
    return null;
  }

  return (
    <motion.div
      className="overflow-hidden rounded-sm transition-all duration-300 cursor-pointer flex-1 min-w-[180px] max-w-[368px] bg-black relative"
      whileHover={{ scale: 1.02 }}
    >
      {type === "image" ? (
        <img
          src={src}
          alt="Event media"
          onLoad={handleImageLoad}
          className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
        />
      ) : (
        <>
          <div 
            className="w-full h-full bg-black flex items-center justify-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <video
              ref={videoRef}
              src={src}
              onLoadedMetadata={handleVideoLoad}
              onError={handleVideoError}
              className="w-full h-full object-cover"
              playsInline
              preload="auto"
              crossOrigin="anonymous"
            />
          </div>
          {videoError && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-xs text-gray-400 text-center p-2">
              <p>Audio only</p>
            </div>
          )}
          {videoError && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-xs text-gray-400 text-center p-2">
              <p>Audio only</p>
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}