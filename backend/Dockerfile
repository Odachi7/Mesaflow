FROM node:20-alpine

WORKDIR /app

# Install PostgreSQL client and netcat for wait script
RUN apk add --no-cache postgresql-client netcat-openbsd

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application
RUN npm run build

# Copy wait script
COPY wait-for-postgres.sh /wait-for-postgres.sh
RUN chmod +x /wait-for-postgres.sh

# Expose port
EXPOSE 3001

# Start application with wait
CMD ["/wait-for-postgres.sh", "postgres", "npm", "run", "start:prod"]
