# The Staging Course

A modern learning management system for home staging courses.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **Authentication**: NextAuth.js (Auth.js)
- **Payments**: Stripe (coming soon)
- **Video**: Bunny.net Stream (coming soon)
- **Storage**: Cloudflare R2 (coming soon)

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Running the Development Server

```bash
npm run dev
```

Opens at **http://localhost:3000**

### Viewing the Database (Prisma Studio)

```bash
npx prisma studio
```

Opens at **http://localhost:5555**

### Running Both Together

Open two terminal tabs:

**Terminal 1 - App:**
```bash
npm run dev
```

**Terminal 2 - Database GUI:**
```bash
npx prisma studio
```

## All Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open database GUI (port 5555) |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma migrate dev` | Create and apply migrations |

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin dashboard routes
│   ├── (auth)/            # Authentication routes (login, register)
│   ├── (dashboard)/       # User dashboard routes
│   ├── (marketing)/       # Public marketing pages
│   └── api/               # API routes
├── actions/               # Server actions
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── courses/          # Course-related components
│   ├── layout/           # Layout components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   ├── session.ts        # Auth helpers
│   ├── utils.ts          # Utility functions
│   └── validations/      # Zod schemas
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema file
└── types/                # TypeScript type definitions
```

## Database Schema

| Model | Purpose |
|-------|---------|
| User | Authentication and user profiles |
| Course | Course metadata and pricing |
| Chapter | Course sections/modules |
| Lesson | Individual lessons (content, video) |
| Resource | Downloadable materials (PDFs, links) |
| Enrollment | User course access records |
| LessonProgress | Lesson completion tracking |
| Certificate | Course completion certificates |
| Purchase | One-time payment records |
| Subscription | Stripe subscription management |

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `AUTH_SECRET` - NextAuth secret key
- `AUTH_URL` - App URL (http://localhost:3000 for dev)

## License

Private - All rights reserved.
