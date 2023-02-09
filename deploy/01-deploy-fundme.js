// function deployFunc() {
//   console.log("hi")
// }

// module.exports.default = deployFunc

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network, deployments } = require("hardhat")
const chainId = network.config.chainId
const { verify } = require("../utils/verify")

//const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  let ethUsdPriceFeedAddress

  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, ethUsdPriceFeedAddress)
  }
}

module.exports.tags = ["all", "fundme"]
