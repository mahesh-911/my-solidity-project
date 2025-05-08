// server.js
require('dotenv').config();

// Access environment variables
const gcpProjectId = process.env.GCP_PROJECT_ID;
const gcpKeyFile = process.env.GCP_KEY_FILE;
const gcpBucketName = process.env.GCP_BUCKET_NAME;
const ethereumNode = process.env.ETHEREUM_NODE;
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

const express = require('express');
const bodyParser = require('body-parser');
const Web3 = require('web3');
const { Storage } = require('@google-cloud/storage');
const redis = require('redis');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Redis
const redisClient = redis.createClient({
  host: redisHost || 'localhost',
  port: redisPort || 6379
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

// GCS config
const storage = new Storage({
  projectId: gcpProjectId,
  keyFilename: gcpKeyFile || './gcp-service-account.json'
});
const bucketName = gcpBucketName || 'blockchain-app-bucket';
const bucket = storage.bucket(bucketName);

// Blockchain setup
const web3 = new Web3(ethereumNode || 'http://localhost:8545');
const contractABI = require('./contractABI.json');
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI, contractAddress);

// QoS Middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const contentLength = res.get('Content-Length');
    console.log(`QoS Metrics - Method: ${req.method}, Path: ${req.path}, Duration: ${duration}ms, Size: ${contentLength || 0} bytes`);
  });

  next();
});

// GCS Helpers
async function uploadToGCS(fileName, data) {
  const file = bucket.file(fileName);
  await file.save(JSON.stringify(data));
  return file;
}

async function downloadFromGCS(fileName) {
  const file = bucket.file(fileName);
  const [data] = await file.download();
  return JSON.parse(data.toString());
}

// Routes

app.get('/api/data', async (req, res) => {
  try {
    redisClient.get('cached_data', async (err, data) => {
      if (data) {
        return res.json({ source: 'cache', data: JSON.parse(data) });
      }

      try {
        const parsedData = await downloadFromGCS('data.json');
        redisClient.setex('cached_data', 300, JSON.stringify(parsedData));
        res.json({ source: 'gcs', data: parsedData });
      } catch (error) {
        if (error.code === 404) {
          return res.status(404).json({ error: 'Data not found in storage' });
        }
        throw error;
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/transaction', async (req, res) => {
  try {
    const { from, to, amount, privateKey } = req.body;

    if (!from || !to || !amount || !privateKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const txObject = {
      from,
      to,
      value: web3.utils.toWei(amount, 'ether'),
      gas: 2000000
    };

    const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    const txRecord = {
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      from,
      to,
      amount,
      timestamp: new Date().toISOString()
    };

    const fileName = `transactions/${uuidv4()}.json`;
    await uploadToGCS(fileName, txRecord);

    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gcsFile: fileName
    });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Transaction failed', details: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    blockchainNetwork: web3.currentProvider.host,
    gcpBucket: bucketName
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Connected to blockchain node: ${web3.currentProvider.host}`);
  console.log(`Using Google Cloud Storage bucket: ${bucketName}`);
});

// ✅ Export for testing or other usage
module.exports = app;
