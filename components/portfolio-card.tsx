import { Artist } from "@/lib/artists";

interface PortfolioCardProps {
  artist: Artist;
}

export default function PortfolioCard({ artist }: PortfolioCardProps) {
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md w-64">
      <img
        src={artist.image}
        alt={artist.name}
        className="w-full h-40 object-cover rounded-md mb-4"
      />
      <h2 className="text-xl font-semibold">{artist.name}</h2>
      <p className="text-sm text-gray-400">{artist.role}</p>
      <p className="mt-4 text-sm">{artist.quote}</p>
      <div className="mt-4 flex gap-4">
        <a
          href={artist.socialLinks.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline text-sm"
        >
          Instagram
        </a>
        <a
          href={artist.socialLinks.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:underline text-sm"
        >
          Spotify
        </a>
      </div>
    </div>
  );
}