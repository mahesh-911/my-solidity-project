FROM node:23-alpine

WORKDIR /app

# Install required dependencies
COPY ../package*.json ./
RUN npm install

# Copy contracts, config, scripts, and tests
COPY ../contracts ./contracts
COPY ../scripts ./scripts
COPY ../test ./test
COPY ../hardhat.config.js ./

# Default command to run tests or start node
CMD ["npx", "hardhat", "test"]
