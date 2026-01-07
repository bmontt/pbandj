import { Artist } from "@/lib/artists";
import { FaInstagram, FaSpotify, FaSoundcloud, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

interface PortfolioCardProps {
    artist: Artist;
}

export default function PortfolioCard({ artist, style }: PortfolioCardProps & { style?: React.CSSProperties }) {
    return (
        <motion.div 
            className="bg-black/40 border border-gray-700/30 text-white p-4 sm:p-6 md:p-8 rounded-sm shadow-lg hover:border-gray-600/50 transition-all duration-300 glow-yellow-sm flex-shrink-0"
            whileHover={{ borderColor: "rgb(107 114 128 / 0.5)" }}
            style={{ width: "auto", minWidth: "280px", maxWidth: "400px", ...style }}
        >
            <img
                src={artist.image}
                alt={artist.name}
                className="w-full h-48 object-cover rounded-sm mb-4"
            />
            <h2 className="text-lg sm:text-xl font-light text-white/95">{artist.name}</h2>
            <p className="text-xs sm:text-sm text-gray-400/80">{artist.role}</p>
            <p className="mt-4 text-xs sm:text-sm font-light leading-relaxed whitespace-pre-wrap text-gray-300/90">{artist.quote}</p>
            <div className="mt-4 flex gap-4">
                {artist.socialLinks.instagram && (
                    <a href={artist.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400/80 hover:text-white/95 transition-colors">
                        <FaInstagram className="w-5 h-5" />
                    </a>
                )}
                {artist.socialLinks.spotify && (
                    <a href={artist.socialLinks.spotify} target="_blank" rel="noopener noreferrer" className="text-gray-400/80 hover:text-white/95 transition-colors">
                        <FaSpotify className="w-5 h-5" />
                    </a>
                )}
                {artist.socialLinks.soundcloud && (
                    <a href={artist.socialLinks.soundcloud} target="_blank" rel="noopener noreferrer" className="text-gray-400/80 hover:text-white/95 transition-colors">
                        <FaSoundcloud className="w-5 h-5" />
                    </a>
                )}
                {artist.socialLinks.github && (
                    <a href={artist.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-400/80 hover:text-white/95 transition-colors">
                        <FaGithub className="w-5 h-5" />
                    </a>
                )}
            </div>
        </motion.div>
    );
}