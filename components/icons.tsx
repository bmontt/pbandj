// Social icons, rendered on the server as inline SVG (no client JS).
import { FaGithub, FaInstagram, FaSoundcloud, FaSpotify } from "react-icons/fa6";
import type { IconType } from "react-icons";

export const ICONS: Record<string, IconType> = {
  instagram: FaInstagram,
  soundcloud: FaSoundcloud,
  spotify: FaSpotify,
  github: FaGithub,
};
