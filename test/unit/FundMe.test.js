const { assert, expect } = require("chai")
const { deployments, ethers } = require("hardhat")

describe("Fundme", async function () {
  let fundMe
  let deployer
  let mockV3Aggregator
  const sendValue = ethers.utils.parseEther("1")

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer
    await deployments.fixture(["all"])
    fundMe = await ethers.getContract("FundMe", deployer)
    mockV3Aggregator = await ethers.getContract("mockV3Aggregator", deployer)
  })

  describe("constructor", async function () {
    it("Sets aggregator addresses", async function () {
      const response = await fundMe.priceFeed()
      assert.equal(response, mockV3Aggregator.address)
    })
  })

  describe("fund", async function () {
    it("Fails if not enough ETH", async function () {
      await expect(fundMe.fund()).to.be.revertedWith("Spend more ETH")
    })

    it("updates funded amount", async function () {
      await fundMe.fund({ value: sendValue })
      const response = await fundMe.addressToAmountFunded(deployer.address)
      assert.equal(response.toString(), sendValue.toString())
    })
    it("adds funders to array", async function () {
      await fundMe.fund({ value: sendValue })
      const response = await fundMe.funders(0)
      assert.equal(funder, deployer)
    })
  })

  describe("withdraw", async function () {
    beforeEach(async function () {
      fundMe.fund({ value: sendValue })
    })
    it("withdraw ETH from founder", async function () {
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

      const transactionResponse = await fundMe.withdraw()
      const transactionReciept = await transactionResponse.wait(1)
      const { gasUsed, effectiveGasPrice } = transactionReciept
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

      assert.equal(endingFundMeBalance, 0)
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      )
    })

    it("allows to withdraw multiple funders", async function () {
      const accounts = await ethers.getSigners()
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i])
        await fundMeConnectedContract.fund({ value: sendValue })
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

      const transactionResponse = await fundMe.withdraw()
      const transactionReciept = await transactionResponse.wait(1)
      const { gasUsed, effectiveGasPrice } = transactionReciept
      const gasCost = gasUsed.mul(effectiveGasPrice)

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      )
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

      assert.equal(endingFundMeBalance, 0)
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      )

      await expect(fundMe.funders(0)).to.be.reverted
      for (i = 1; i < 6; i++) {
        assert.equal(await fundMe.addressToAmountFunded(accounts[i]).address, 0)
      }
    })

    it("only allows owner to withdraw", async function () {
      const accounts = await ethers.getSigners()
      const attacker = accounts[1]
      const attackerConnectedContract = await fundMe.connect(attacker)
      await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
        "NotOwner"
      )
    })
  })
})
