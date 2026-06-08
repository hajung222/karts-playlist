# K-Arts Playlist Deploy

This is the internet-public version of the K-Arts Playlist project.

## 1. Create Supabase DB

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. Confirm `public.posts` is empty.

## 2. Set Vercel Environment Variables

Add these variables in Vercel Project Settings:

```txt
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

Use the service role key only in Vercel environment variables. Do not expose it in browser code.

## 3. Deploy

From this folder:

```sh
npm install
npx vercel
```

After deployment, use the Vercel production URL for the QR code.

## 4. Reset All Songs

Run this in Supabase SQL Editor:

```sql
truncate table public.posts;
```

The site will start from a blank playlist.
