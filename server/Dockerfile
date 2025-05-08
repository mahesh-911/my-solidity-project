# Use a secure, specific version of Node
FROM node:23-alpine

# Set the working directory inside the container
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

# Copy service account credentials
COPY ./gcp-service-account.json ./gcp-service-account.json

# Expose the backend port
EXPOSE 5000

# Define environment variables
ENV PORT=5000
ENV REDIS_HOST=redis
ENV ETHEREUM_NODE=http://geth:8545

# Start the backend server
CMD ["node", "server.js"]
