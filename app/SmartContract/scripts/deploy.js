const hre = require("hardhat");

async function main() {
  const Subscription = await hre.ethers.getContractFactory("Subscription");
  const subscription = await Subscription.deploy();

  await subscription.waitForDeployment();
  console.log("Subscription deployed to:", await subscription.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
