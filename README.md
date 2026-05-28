This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, make sure PostgreSQL is running and `.env.local` contains a valid `DATABASE_URL`, then run the development server:

```env
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/rased
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=rased-documents
MINIO_REGION=us-east-1
NATIONAL_ID_UPLOAD_EXPIRY_SECONDS=900
```

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001/users](http://localhost:3001/users) with your browser to see the result.

## User Directory Data Source

- User data is read from PostgreSQL through `app/api/users`.
- On first read, the API creates the `users` table and auto-seeds sample users if the table is empty.
- Creating a user stores the National ID card PDF reference in PostgreSQL and returns an expiring MinIO upload URL for the PDF.
- To manually seed (or reseed), call:

```bash
curl -X POST http://localhost:3001/users/api/users/seed \
  -H "Content-Type: application/json" \
  -d '{"force": false}'
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
