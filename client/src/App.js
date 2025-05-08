// src/services/App.js
import axios from 'axios';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import './App.css';
import { GreeterAddress } from './contracts/contractAddress';
import GreeterABI from './contracts/Greeter.json';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [newGreeting, setNewGreeting] = useState('');
  const [contract, setContract] = useState(null);
  const [txResult, setTxResult] = useState(null);
  const [qosMetrics, setQosMetrics] = useState([]);
  const [latency, setLatency] = useState(0);

  const [transaction, setTransaction] = useState({
    from: '',
    to: '',
    amount: '',
    privateKey: ''
  });

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const greeterContract = new ethers.Contract(GreeterAddress, GreeterABI.abi, signer);
        setContract(greeterContract);
        const currentGreeting = await greeterContract.greet();
        setGreeting(currentGreeting);
      } else {
        alert("Please install MetaMask!");
      }
    };
    init();
  }, []);

  const updateQosMetrics = (endpoint, duration, size) => {
    setQosMetrics(prev => [
      ...prev,
      {
        id: Date.now(),
        endpoint,
        timestamp: new Date().toISOString(),
        duration,
        size
      }
    ].slice(-10)); // Keep last 10
  };

  const fetchData = async () => {
    const start = Date.now();
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/data'); // ✅ Fixed port
      const end = Date.now();
      setLatency(end - start);
      setData(response.data);
      updateQosMetrics('GET /api/data', end - start, JSON.stringify(response.data).length);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    const start = Date.now();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/transaction', transaction); // ✅ Fixed port
      const end = Date.now();
      setTxResult(response.data);
      updateQosMetrics('POST /api/transaction', end - start, JSON.stringify(response.data).length);
      alert('Transaction successful!');
    } catch (error) {
      console.error('Transaction error:', error);
      alert(`Transaction failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetGreeting = async () => {
    if (!contract) return;
    try {
      const tx = await contract.setGreeting(newGreeting);
      await tx.wait();
      const updated = await contract.greet();
      setGreeting(updated);
      alert("Greeting updated on the blockchain!");
    } catch (err) {
      console.error("Error setting greeting:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransaction(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cloud-Blockchain Integration</h1>
        <p>Current latency: {latency}ms</p>
      </header>

      <div className="content">
        <section>
          <h2>Fetch Cloud Data</h2>
          <button onClick={fetchData} disabled={loading}>
            {loading ? 'Loading...' : 'Get Data'}
          </button>
          {data && (
            <div className="data-display">
              <p>Data source: {data.source}</p>
              <pre>{JSON.stringify(data.data, null, 2)}</pre>
            </div>
          )}
        </section>

        <section>
          <h2>Interact with Smart Contract</h2>
          <p>Current Greeting: {greeting}</p>
          <input
            type="text"
            placeholder="Set new greeting"
            value={newGreeting}
            onChange={(e) => setNewGreeting(e.target.value)}
          />
          <button onClick={handleSetGreeting}>Set Greeting</button>
        </section>

        <section>
          <h2>Blockchain Transaction</h2>
          <form onSubmit={handleTransaction}>
            <input type="text" name="from" placeholder="From" value={transaction.from} onChange={handleInputChange} required />
            <input type="text" name="to" placeholder="To" value={transaction.to} onChange={handleInputChange} required />
            <input type="number" name="amount" placeholder="Amount in ETH" step="0.01" value={transaction.amount} onChange={handleInputChange} required />
            <input type="password" name="privateKey" placeholder="Private Key" value={transaction.privateKey} onChange={handleInputChange} required />
            <button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Send Transaction'}</button>
          </form>
          {txResult && (
            <div className="tx-result">
              <h3>Transaction Result</h3>
              <p>Hash: {txResult.transactionHash}</p>
              <p>Block: {txResult.blockNumber}</p>
            </div>
          )}
        </section>

        <section className="qos-metrics">
          <h2>Quality of Service Metrics</h2>
          <table>
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Timestamp</th>
                <th>Duration (ms)</th>
                <th>Size (bytes)</th>
              </tr>
            </thead>
            <tbody>
              {qosMetrics.map(metric => (
                <tr key={metric.id}>
                  <td>{metric.endpoint}</td>
                  <td>{new Date(metric.timestamp).toLocaleTimeString()}</td>
                  <td>{metric.duration}</td>
                  <td>{metric.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export default App;
