# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com
2. **PostgreSQL Database**: Set up a PostgreSQL database (recommended: Neon, Supabase, or Vercel Postgres)
3. **Google OAuth**: Configure Google OAuth credentials

## Environment Variables for Production

Set these in your Vercel project settings:

### Required Variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
GOOGLE_API_KEY=your_gemini_api_key
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Optional Variables:
```
OPENAI_API_KEY=your_openai_api_key
REPLICATE_API_TOKEN=your_replicate_token
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
REMOVEBG_API_KEY=your_removebg_api_key
CLIPDROP_API_KEY=your_clipdrop_api_key
```

## Deployment Steps

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Set Environment Variables**: Add all required variables in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy your app
4. **Database Setup**: Run Prisma migrations after deployment

## Local Development

For local development, use SQLite:
```
DATABASE_URL="file:./dev.db"
```

## Database Migration

After deployment, run:
```bash
npx prisma migrate deploy
npx prisma generate
```

## Google OAuth Setup

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for local)
   - `https://your-app-name.vercel.app/api/auth/callback/google` (for production)
