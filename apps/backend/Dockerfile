FROM node:20-alpine

# Install OpenSSL and build tools for Prisma and bcrypt - split into steps to avoid I/O errors
RUN apk add --no-cache openssl openssl-dev libc6-compat bash
RUN apk add --no-cache python3 make
RUN apk add --no-cache g++ || apk add --no-cache --force-overwrite g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema before npm install (needed for prisma generate)
COPY prisma ./prisma/

# Clean install to ensure proper architecture binaries
RUN npm ci --only=production=false

# Copy rest of the application (excluding node_modules via .dockerignore)
COPY . .

# Build the application
RUN npm run build

# Verify dist folder exists and show contents
RUN ls -la /app/ && echo "=== Dist folder ===" && ls -la /app/dist/

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 3001

CMD ["bash", "/app/entrypoint.sh"]
