import PortfolioCard from "@/components/portfolio-card";
import { artists } from "@/lib/artists";

export default function ArtistBPage() {
  const artist = artists.find((a) => a.id === "b");

  if (!artist) return <div>Artist not found</div>;

  return (
    <div className="flex items-start p-8">
      <PortfolioCard artist={artist} />
      <div className="ml-8">
        <h1 className="text-4xl font-light">Welcome to {artist.name}'s Portfolio</h1>
        <p className="mt-4 text-gray-400">{artist.quote}</p>
      </div>
    </div>
  );
}