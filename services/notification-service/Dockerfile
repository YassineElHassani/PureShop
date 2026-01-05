# Build stage
FROM node:20-slim AS builder

# Install OpenSSL and other dependencies for Prisma
RUN apt-get update -y && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma Client first
RUN npm run prisma:generate

RUN npm run build

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# EXPOSE 3006

# HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
#   CMD node -e "require('http').get('http://localhost:3006/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["docker-entrypoint.sh"]