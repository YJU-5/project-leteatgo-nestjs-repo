# 백엔드의 dockerfile
# 1. Use Node.js 20 as the base image
FROM node:20

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# 4. Copy the rest of the source code into the container
COPY . .

# 5. Build the NestJS app
RUN npm run build

# 6. Expose port 3001 (the port NestJS will run on)
EXPOSE 3001

# 7. Start the server in production mode
CMD ["npm", "run", "start:dev"]