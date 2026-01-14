# PB&J Sounds

East coast-based music collective and record label focused on bringing underground uk/minimal house to the forefront of electronic music.

## About

PB&J Sounds is a dynamic collective of artists and producers backed by a grassroots team dedicated to crafting immersive audio-visual experiences. With a focus on innovative sound design and genre-blending compositions, we shape the future of underground electronic music.

## Features

- **Artist Profiles**: Showcase of collective members with individual portfolios
- **Event Gallery**: Video and image galleries of past events and performances
- **Latest Releases**: Music showcase with SoundCloud integration
- **Join Our Team**: Application form for artists, producers, engineers, and community contributors
- **Responsive Design**: Mobile-optimized experience with smooth animations
- **Audio-Visual Integration**: Immersive multimedia content presentation

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Supabase](https://supabase.com/) - Database & Authentication
- [Resend](https://resend.com/) - Email service
- [Vercel Blob](https://vercel.com/storage/blob) - File uploads

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Development

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the project.

### Build

```bash
pnpm build
pnpm start
```

## Environment Variables

Required environment variables in `.env.local`:
- `NEXT_PUBLIC_SOUNDCLOUD_PLAYLIST_URL` - SoundCloud playlist URL
- `EMAIL_FROM` - Sender email address
- `DEMO_RECIPIENT_EMAIL` - Email for application submissions
- Supabase credentials
- Resend API key

## File Structure

- `/app` - Next.js app directory with API routes
- `/components` - React components (UI, sections, custom hooks)
- `/lib` - Utilities, data, and services
- `/public` - Static assets (images, videos, fonts)
- `/styles` - Global CSS and Tailwind configuration

## Key Components

- **Header**: Fixed navigation with countdown timer
- **EPK Section**: Team showcase and past events
- **Join Our Team**: Application form with optional file attachments
- **Artist Pages**: Individual artist profiles with event videos
- **Latest Releases**: Music library and SoundCloud integration

## Deployment

Deployed on [Vercel](https://vercel.com) for optimal Next.js performance and integration with Vercel services (Blob storage, Analytics).

## Learn More

To learn more about Next.js, take a look at the [Next.js Documentation](https://nextjs.org/docs).

## Contributing

Contributions welcome! Please ensure code follows project conventions and test changes locally before submitting.

---

Built with ❤️ by PB&J Sounds
