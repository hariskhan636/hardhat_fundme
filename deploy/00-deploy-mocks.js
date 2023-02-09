const { network } = require("hardhat")
const {
  developmentChains,
  DECIMALS,
  INIT_ANS,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  if (chainId == 31337) {
    log("Local network detected! Deploying mocks...")
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INIT_ANS],
    })
    log("Mocks Deployed!")
    log("------------------------------------------------")
  }
}

module.exports.tags = ["all", "mocks"]
