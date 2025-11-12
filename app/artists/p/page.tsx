import PortfolioCard from "@/components/portfolio-card";
import { artists } from "@/lib/artists";

export default function ArtistPPage() {
  const artist = artists.find((a) => a.id === "p");

  if (!artist) return <div>Artist not found</div>;

  return (
    <div className="flex items-start p-8">
      <PortfolioCard artist={artist} />
      <div className="ml-8">
        <h1 className="text-4xl font-light">Welcome to {artist.name}'s Portfolio</h1>
        <p className="mt-4 text-gray-400">{artist.quote}</p>
        <video
          src={artist.videoUrl}
          controls
          className="mt-8 w-full max-w-2xl rounded-md shadow-md"
        />
      </div>
    </div>
  );
}