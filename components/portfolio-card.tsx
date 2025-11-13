import { Artist } from "@/lib/artists";
import { FaInstagram, FaSpotify } from "react-icons/fa";

interface PortfolioCardProps {
    artist: Artist;
}

export default function PortfolioCard({ artist }: PortfolioCardProps) {
    return (
        <div className="bg-gray-800 text-white p-8 rounded-lg shadow-md w-80:w-96">
            <img
                src={artist.image}
                alt={artist.name}
                className="w-full h-48 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold">{artist.name}</h2>
            <p className="text-sm text-gray-400">{artist.role}</p>
            <p className="mt-4 text-sm">{artist.quote}</p>
            <div className="mt-4 flex gap-4">
                <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                    <FaInstagram className="w-6 h-6 text-blue-400" />
                </a>
                <a href={artist.socialLinks.spotify} target="_blank" rel="noopener noreferrer">
                    <FaSpotify className="w-6 h-6 text-green-400" />
                </a>
            </div>
        </div>
    );
}