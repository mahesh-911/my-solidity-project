# my-solidity-project

# 🔗 Cloud-Integrated Blockchain Storage System [![GitHub](https://img.shields.io/badge/GitHub-Repo-blue?logo=github)](https://github.com/mahesh-911/my-solidity-project)

## 🚀 Overview

This project is a blockchain-powered cloud storage application that:
- Stores and retrieves files securely on Google Cloud Storage (GCS)
- Records transaction metadata on Ethereum blockchain
- Ensures fast access using Redis caching
- Provides a dashboard for user interaction

## 🔧 Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Smart Contracts**: Solidity + Hardhat
- **Blockchain Network**: Ethereum (local or testnet)
- **Cloud Storage**: Google Cloud Storage (GCS)
- **Cache**: Redis
- **DevOps**: Docker, Docker Compose
- **Security**: .env files, HTTPS, helmet middleware

## 📦 Features

- 📂 Upload and download files to/from GCS
- 🔐 Blockchain-based logging of each transaction
- 🔁 Redis caching for high-speed file access
- 🧠 Contract interaction via `ethers.js`
- 📊 Real-time performance logging (QoS monitoring)
- 🔍 Health check endpoints for debugging
- 🌐 Docker-ready for deployment

## 🛠️ Setup Instructions

1. Clone the repo:
   ```bash
   git clone https://github.com/mahesh-911/my-solidity-project.git
   cd my-solidity-project
## create .env files in the server and client folder like this as shown below
GCP_PROJECT_ID=your_project_id
GCP_KEY_FILE=./gcp-service-account.json
GCP_BUCKET_NAME=your_bucket
ETHEREUM_NODE=http://localhost:8545
REDIS_HOST=localhost
REDIS_PORT=6379
CONTRACT_ADDRESS=0xYourContractAddress
## INSTALL DEPENDENCIES
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
## IF YOU CAN USE DOCKER YOU CAN USE IT AS SHOWN BELOW
docker-compose up --build
## POSSIBLE ISSUES IN MY PROJECT
| Issue                                                                              | Description                                                                                                 | Solution                                                                                                                  |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `contractAddress.js` shows a lock icon in VSCode                                   | It's marked read-only due to system/user permissions.                                                       | Either change permissions using `chmod +w`, or recreate the file.                                                         |
| `.env` values accidentally committed                                               | Sensitive data should not be tracked by Git.                                                                | Add `.env` to `.gitignore`, regenerate API keys, and remove from history using `bfg-repo-cleaner` or `git filter-branch`. |
| Push fails with `error: failed to push some refs`                                  | This happens when the remote branch has updates not in your local copy.                                     | Run `git pull --rebase origin main` to sync before pushing.                                                               |
| **Redis client connection failure**                                                | You may get errors like `ECONNREFUSED`, `ClientClosedError`, or `Cannot connect to Redis` during app start. | 🔹 Make sure Redis server is running (locally or via Docker)                                                              |
| 🔹 Check `.env` variables: `REDIS_HOST=localhost`, `REDIS_PORT=6379`               |                                                                                                             |                                                                                                                           |
| 🔹 If using Docker Compose, ensure Redis service is named correctly and accessible |                                                                                                             |                                                                                                                           |
| 🔹 Retry connection in code using Redis retry strategy or delay logic              |                                                                                                             |                                                                                                                           |
| Smart contract interaction issues                                                  | Errors like `contract not deployed` or undefined contract instances.                                        | Make sure the contract is deployed with `hardhat` and `contractAddress.js` points to correct address.                     |


