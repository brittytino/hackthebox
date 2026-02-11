FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema before npm install (needed for prisma generate)
COPY prisma ./prisma/

# Install dependencies (will run prisma generate as postinstall)
RUN npm install

# Copy rest of the application
COPY . .

# Build the application
RUN npm run build

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 3001

CMD ["sh", "/app/entrypoint.sh"]
