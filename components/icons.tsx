// Platform icons, rendered on the server as inline SVG (no client JS).
import {
  FaArrowUpRightFromSquare,
  FaEnvelope,
  FaGithub,
  FaInstagram,
  FaLocationDot,
  FaSoundcloud,
  FaSpotify,
  FaTicket,
  FaYoutube,
} from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { Platform } from "@/lib/links";

export const ICONS: Record<Platform, IconType> = {
  instagram: FaInstagram,
  soundcloud: FaSoundcloud,
  spotify: FaSpotify,
  youtube: FaYoutube,
  github: FaGithub,
  email: FaEnvelope,
  tickets: FaTicket,
  map: FaLocationDot,
  web: FaArrowUpRightFromSquare,
};
