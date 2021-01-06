import BigNumber from 'utils/bignumber'
import { ethers, utils } from 'ethers'
import Web3 from 'web3'
// eslint-disable-next-line
import { provider, TransactionReceipt } from 'web3-core'
import { AbiItem } from 'web3-utils'

import ERC20ABI from 'index-sdk/abi/ERC20.json'
import ISSUEABI from 'index-sdk/abi/Issuance.json'

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const waitTransaction = async (provider: provider, txHash: string) => {
  const web3 = new Web3(provider)
  let txReceipt: TransactionReceipt | null = null
  while (txReceipt === null) {
    const r = await web3.eth.getTransactionReceipt(txHash)
    txReceipt = r
    await sleep(2000)
  }
  return txReceipt.status
}

export const approve = async (
  userAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  provider: provider,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  try {
    const tokenContract = getERC20Contract(provider, tokenAddress)
    console.log(tokenContract)
    return tokenContract.methods
      .approve(spenderAddress, ethers.constants.MaxUint256.toString())
      .send(
        { from: userAddress, gas: 80000 },
        async (error: any, txHash: string) => {
          if (error) {
            console.log('ERC20 could not be approved', error)
            onTxHash && onTxHash('')
            return false
          }
          if (onTxHash) {
            onTxHash(txHash)
          }
          const status = await waitTransaction(provider, txHash)
          if (!status) {
            console.log('Approval transaction failed.')
            return false
          }
          return true
        }
      )
  } catch (e) {
    console.log(e)
    return false
  }
}

export const getAllowance = async (
  userAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  provider: provider
): Promise<string> => {
  try {
    const tokenContract = getERC20Contract(provider, tokenAddress)
    const allowance: string = await tokenContract.methods
      .allowance(userAddress, spenderAddress)
      .call()
    return allowance
  } catch (e) {
    return '0'
  }
}

export const getEthBalance = async (
  provider: provider,
  userAddress: string
): Promise<string> => {
  const web3 = new Web3(provider)
  try {
    const balance: string = await web3.eth.getBalance(userAddress)
    return balance
  } catch (e) {
    return '0'
  }
}

export const getBalance = async (
  provider: provider,
  tokenAddress: string,
  userAddress: string
): Promise<string> => {
  const tokenContract = getERC20Contract(provider, tokenAddress)
  try {
    const balance: string = await tokenContract.methods
      .balanceOf(userAddress)
      .call()
    return balance
  } catch (e) {
    return '0'
  }
}

export const getERC20Contract = (provider: provider, address: string) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    (ERC20ABI.abi as unknown) as AbiItem,
    address
  )
  return contract
}

export const bnToDec = (bn: BigNumber, decimals = 18) => {
  return bn.dividedBy(new BigNumber(10).pow(decimals)).toNumber()
}

export const decToBn = (dec: number, decimals = 18) => {
  return new BigNumber(dec).multipliedBy(new BigNumber(10).pow(decimals))
}

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18) => {
  return balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed()
}

export const makeEtherscanLink = (transactionHash: string) => {
  return `https://etherscan.io/tx/${transactionHash}`
}

export const issue = async (
  amount: number,
  userAddress: string | null | undefined,
  provider: provider
): Promise<boolean> => {
  try {
    const amountConverted = utils.parseEther(amount.toString()).toString()
    const tokenContract = getIssuanceContract(
      provider,
      '0x0f0eE18189FB5472226A7E54e0c7a3BB1155705D'
    )
    console.log(tokenContract)
    return tokenContract.methods
      .issue(
        '0xf9d50338Fb100B5a97e79615a8a912e10975b61c',
        amountConverted,
        userAddress
      )
      .send(
        { from: userAddress, gas: 278649 },
        async (error: any, txHash: string) => {
          if (error) {
            console.log('Could not issue token!', error)
            return false
          }
          const status = await waitTransaction(provider, txHash)
          if (!status) {
            console.log('Issue transaction failed.')
            return false
          }
          return true
        }
      )
  } catch (e) {
    console.log(e)
    return false
  }
}

export const redeem = async (
  amount: number,
  userAddress: string | null | undefined,
  provider: provider
): Promise<boolean> => {
  try {
    const amountConverted = utils.parseEther(amount.toString()).toString()
    console.log(amountConverted)
    const tokenContract = getIssuanceContract(
      provider,
      '0x0f0eE18189FB5472226A7E54e0c7a3BB1155705D'
    )
    console.log(tokenContract)
    return tokenContract.methods
      .redeem(
        '0xf9d50338Fb100B5a97e79615a8a912e10975b61c',
        amountConverted,
        userAddress
      )
      .send(
        { from: userAddress, gas: 313906 },
        async (error: any, txHash: string) => {
          if (error) {
            console.log('Could not redeem token!', error)
            return false
          }
          const status = await waitTransaction(provider, txHash)
          if (!status) {
            console.log('Redeem transaction failed.')
            return false
          }
          return true
        }
      )
  } catch (e) {
    console.log(e)
    return false
  }
}

export const getIssuanceContract = (provider: provider, address: string) => {
  const web3 = new Web3(provider)
  const contract = new web3.eth.Contract(
    (ISSUEABI.abi as unknown) as AbiItem,
    address
  )
  return contract
}
