# # Use the official Node.js image as the base image
# FROM node:20

# # Set the working directory inside the container
# WORKDIR /usr/src/app

# # Copy package.json and package-lock.json to the working directory
# COPY package*.json ./

# # Install the application dependencies
# RUN npm install

# # Copy the rest of the application files
# COPY . .

# # Build the NestJS application
# RUN npm run build

# # Expose the application port
# EXPOSE 3001

# # Command to run the application
# CMD ["node", "dist/main"]

# 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 프로덕션 스테이지
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3005

EXPOSE 3005

CMD ["npm", "start"]