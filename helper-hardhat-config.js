const networkConfig = {
  4: {
    name: "Rinkeby",
    ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
  },

  31337: {
    name: "localhost",
  },

  42: {
    name: "kovan",
    ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
  },
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INIT_ANS = 200000000000

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INIT_ANS,
}
