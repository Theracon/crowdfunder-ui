// @ts-nocheck
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const log = console.log
const fundValue = ethers.utils.parseUnits("0.1", "ether")

const connectBtn = document.getElementById("connect-btn")
const fundBtn = document.getElementById("fund-btn")
const withdrawBtn = document.getElementById("withdraw-btn")
const balanceBtn = document.getElementById("balance-btn")
const balanceText = document.getElementById("balance")

connectBtn.onclick = connect
fundBtn.onclick = () => fund(fundValue)
withdrawBtn.onclick = withdraw
balanceBtn.onclick = balance

async function connect() {
  if (typeof window.ethereum != "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" })
    connectBtn.innerText = "Connected!"
  } else {
    connectBtn.innerText = "Please install Metamask."
  }
}

async function fund() {
  if (typeof window.ethereum != "undefined") {
    const amountInput = document.getElementById("fund-input")
    const amount = ethers.utils.parseUnits(amountInput.value, "ether")
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    log(`Funding with ${amountInput.value} ETH...`)

    try {
      const txResponse = await contract.fund({ value: amount })
      await txListener(txResponse, provider)
      log("Done.")
    } catch (error) {
      log(error)
    }
  } else {
    fundBtn.innerText = "Funding failed."
  }
}

async function withdraw() {
  if (typeof window.ethereum != "undefined") {
    log("Withdrawal pending...")
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    try {
      const txResponse = await contract.withdraw()
      await txListener(txResponse, provider)
    } catch (error) {
      log(error)
    }
  } else {
    withdrawBtn.innerText = "Withdrawal failed."
  }
}

async function balance() {
  if (typeof window.ethereum != "undefined") {
    const provider = await new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    balanceText.innerText = `${ethers.utils.formatEther(balance)} ETH`
  } else {
    balanceText.innerText = "Please connect your wallet."
  }
}

function txListener(txResponse, provider) {
  log(`Mining tx: ${txResponse.hash}`)

  return new Promise((resolve, reject) => {
    provider.once(txResponse.hash, (txReceipt) => {
      const confirmations = txReceipt.confirmations
      log(
        `Finished with ${txReceipt.confirmations} block confirmation${
          confirmations > 1 ? "s" : ""
        }`
      )
      resolve()
    })
  })
}
