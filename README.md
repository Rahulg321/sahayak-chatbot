# Sahayak Chatbot

A Next.js-based AI chatbot application built with modern web technologies.

## Prerequisites

Before running this application, you'll need:

- **Node.js** (v18 or higher)
- **pnpm** package manager
- **PostgreSQL** database
- **Redis** server
- **Google Gemini API** key

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
POSTGRES_URL="postgresql://username:password@localhost:5432/sahayak_db"

# Redis
REDIS_URL="redis://localhost:6379"

# AI Provider
GOOGLE_GEMINI_AI_KEY="your_gemini_api_key_here"

# Authentication
AUTH_SECRET="your_auth_secret_here"

# Email (Optional)
RESEND_API_KEY="your_resend_api_key_here"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SERVER_URL="http://localhost:8080"
```

### 3. Set Up Databases

#### PostgreSQL

- Install and start PostgreSQL
- Create a database named `sahayak_db`
- Update the `POSTGRES_URL` in your `.env.local` file

#### Redis

- Install and start Redis server
- Ensure Redis is running on the default port (6379)

### 4. Run Database Migrations

```bash
pnpm db:migrate
```

### 5. Start the Development Server

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Getting API Keys

### Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file as `GOOGLE_GEMINI_AI_KEY`

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio for database management

## Features

- 🤖 AI-powered chatbot using Google Gemini
- 💬 Real-time chat interface
- 📚 Document upload and processing
- 🎤 Voice note transcription
- 🔐 User authentication
- 📊 Chat history and analytics
- 🎨 Modern UI with Tailwind CSS

## Troubleshooting

- **Database connection issues**: Ensure PostgreSQL is running and the connection string is correct
- **Redis connection issues**: Make sure Redis server is started
- **AI model not working**: Verify your Gemini API key is valid and has sufficient credits
- **Authentication errors**: Check that `AUTH_SECRET` is set and unique

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis
- **AI**: Google Gemini API
- **Authentication**: NextAuth.js
- **Package Manager**: pnpm
