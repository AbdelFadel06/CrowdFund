import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
  const crowdFunding = await CrowdFunding.deploy(200); // 2% fees
  await crowdFunding.waitForDeployment();

  console.log("CrowdFunding deployed to:", crowdFunding.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
