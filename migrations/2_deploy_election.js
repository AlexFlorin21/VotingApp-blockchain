const Election = artifacts.require("Election");
const ResultContract = artifacts.require("ResultContract");

module.exports = async function (deployer) {
  // Deploy ResultContract first
  await deployer.deploy(ResultContract);
  const resultInstance = await ResultContract.deployed();

  // Deploy Election and pass the ResultContract address in the constructor
  await deployer.deploy(Election, resultInstance.address);
  const electionInstance = await Election.deployed();

  console.log("ResultContract deployed at:", resultInstance.address);
  console.log("Election deployed at:", electionInstance.address);
};
