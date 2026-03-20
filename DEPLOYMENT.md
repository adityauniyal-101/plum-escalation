# Deployment Guide

## Quick Start (Development)

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

---

## Production Build

### Build Locally

```bash
npm run build
npm start
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build application
FROM base AS builder
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t escalation-manager .
docker run -p 3000:3000 escalation-manager
```

### Vercel Deployment

1. Push code to GitHub
2. Connect to Vercel
3. Vercel auto-detects Next.js and deploys

```bash
npm i -g vercel
vercel --prod
```

---

## Environment Variables

None required for basic deployment. For production enhancements:

```env
# .env.local (development)
# .env.production (production)

# Optional: API endpoints
NEXT_PUBLIC_API_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-id
```

---

## Performance Optimization

### Current Build Stats

- **Total Bundle Size**: ~108 KB (JS)
- **CSS**: ~2.67 KB (dashboard page)
- **Gzip Compressed**: ~30 KB

### Optimization Techniques Already Implemented

✅ Code splitting by route
✅ CSS-in-JS (Tailwind)
✅ Image optimization
✅ Dynamic imports
✅ Tree-shaking

### For Higher Traffic

1. **Add Caching Headers** in `next.config.js`:
   ```javascript
   headers: async () => ({
     '/': [{ key: 'cache-control', value: 'public, max-age=3600' }],
   })
   ```

2. **Database** - Replace localStorage with:
   - PostgreSQL + Prisma
   - MongoDB + Mongoose
   - Firebase Firestore

3. **API Rate Limiting**:
   ```typescript
   // pages/api/upload.ts
   const rateLimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(100, '1 h'),
   });
   ```

---

## Monitoring & Logging

### Add Logging (Recommended)

```bash
npm install winston
```

```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

### Error Tracking

Add Sentry:

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.server.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

## Scaling to Production

### Phase 1: Add Database
Replace localStorage with proper persistence:

```typescript
// lib/db.ts (using Prisma example)
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = prisma;
```

### Phase 2: Add Authentication
```bash
npm install next-auth
```

### Phase 3: Add Analytics
- Google Analytics 4
- PostHog
- Amplitude

### Phase 4: Add Real-time Updates
- WebSockets for live escalation feeds
- Server-Sent Events for updates

---

## Troubleshooting Deployment

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Memory Issues with Large CSV

- Current: Handles ~10,000 emails
- For larger: Implement pagination or streaming

```typescript
// Streaming CSV parser
import { parse } from 'csv-parse';

const parser = fs.createReadStream('file.csv').pipe(parse());

parser.on('readable', async () => {
  let record;
  while ((record = parser.read()) !== null) {
    // Process incrementally
  }
});
```

---

## Backup & Recovery

### Backup Data

```bash
# Export escalations from localStorage-backed API
curl http://localhost:3000/api/escalations > escalations.json

# Or implement database backup
pg_dump escalation_db > backup.sql
```

### Restore Data

```bash
psql escalation_db < backup.sql
```

---

## CDN Setup (Vercel/CloudFlare)

### Enable Automatic CDN (Vercel)
No configuration needed - automatically uses Vercel's global CDN.

### Custom Domain
1. Point DNS to Vercel
2. Add domain in Vercel dashboard
3. SSL certificate auto-generated

---

## Maintenance

### Weekly
- Monitor error logs
- Check performance metrics
- Review escalation volumes

### Monthly
- Update dependencies: `npm update`
- Run security audit: `npm audit fix`
- Backup database

### Quarterly
- Analyze usage patterns
- Optimize scoring rules based on feedback
- Plan feature releases

---

## Support

For deployment issues:
1. Check `npm run build` output
2. Review Vercel/Docker logs
3. Test locally first: `npm run dev`
4. Verify environment variables

Production Status: ✅ Ready for deployment
