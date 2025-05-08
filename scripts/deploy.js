const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Greeter = await ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy("Hello, Hardhat!");

  console.log("Greeter contract deployed to:", greeter.target);

  // Define contracts output directory
  const contractsDir = path.join(__dirname, '../client/src/contracts');

  // Ensure directory exists
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Write contract address to contractAddress.js
  fs.writeFileSync(
    path.join(contractsDir, 'contractAddress.js'),
    `export const GreeterAddress = "${greeter.target}";\n`
  );

  // Write ABI to Greeter.json
  const artifact = await hre.artifacts.readArtifact('Greeter');
  fs.writeFileSync(
    path.join(contractsDir, 'Greeter.json'),
    JSON.stringify(artifact.abi, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
