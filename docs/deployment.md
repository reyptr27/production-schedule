# Deployment & DevOps Guide 🚀

For an enterprise environment like a manufacturing plant, stability and uptime are critical. This guide covers how to deploy the dashboard robustly.

## 1. Environment Preparation

Before deploying to a production server (Windows Server, Linux VM, or Docker), ensure the environment has:
- Node.js `v18.x` or higher installed.
- Network access to the MSSQL Database IP over port `1433`.

Create a production `.env` file on the server. **Do not commit this file to source control.**

```env
# Essential configuration
NEXT_PUBLIC_BASE_URL="http://production-ip:3000"
DB_USER="prod_readonly_user" 
DB_PASSWORD="Secure_Password1!"
DB_SERVER="10.x.x.x"
DB_NAME="ManufacturingDB"
```
*Enterprise Tip:* Always use a dedicated Read-Only SQL user account (`prod_readonly_user`), not `sa` or a master admin account.

## 2. Windows Service Deployment (PM2)

If deploying on a bare-metal Windows Server on the factory floor, the application must survive server reboots automatically. Using `pm2` is recommended over running a loose command prompt.

```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Build the optimized Next.js app
npm run build

# 3. Start via PM2
pm2 start npm --name "schedule-dashboard" -- start

# 4. Configure PM2 to restart on crash and server reboot
pm2 startup
pm2 save
```

## 3. Docker Deployment (Alternative)

For clustered environments (Kubernetes/Swarm), containerization ensures consistency. A standard Next.js `Dockerfile` can be used:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

## 4. Health Checks & Observability

Enterprise networks usually employ monitoring tools (Datadog, PRTG, Zabbix).
- **HTTP Check**: Monitor `http://<server-ip>:3000`. If it returns a `200 OK`, the Next.js server is up.
- **Deep Check**: Monitor `http://<server-ip>:3000/api/schedule`. If it returns a `503 Service Unavailable`, the Node server is alive, but the *Database Connection has failed*. This distinct separation allows network engineers to instantly know where the fault lies.
