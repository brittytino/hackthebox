FROM node:20-alpine

# Install OpenSSL and build tools for Prisma and bcrypt
RUN apk add --no-cache openssl openssl-dev libc6-compat bash python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema before npm install (needed for prisma generate)
COPY prisma ./prisma/

# Clean install to ensure proper architecture binaries
RUN npm ci --no-audit --no-fund

# Copy rest of the application (excluding node_modules via .dockerignore)
COPY . .

# Build the application
RUN npm run build

# Fix line endings
RUN sed -i 's/\r$//' /app/entrypoint.sh

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 43118

CMD ["bash", "/app/entrypoint.sh"]
