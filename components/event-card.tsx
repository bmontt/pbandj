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
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {media.map((item, index) => (
          <div key={index} className="overflow-hidden rounded-lg">
            {item.type === "image" ? (
              <img
                src={item.src}
                alt={`Event media ${index + 1}`}
                className="w-full h-40 object-cover hover:scale-105 transition-transform"
              />
            ) : (
              <video
                src={item.src}
                controls
                className="w-full h-40 object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}