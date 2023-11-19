import ERC20Contract from '@openzeppelin/contracts/build/contracts/ERC20.json'
import ERC721Contract from '@openzeppelin/contracts/build/contracts/ERC721.json'
// import { AbiItem } from 'web3-utils'

// import { ERC20 } from 'src/types/contracts/ERC20.d'
// import { ERC721 } from 'src/types/contracts/ERC721.d'
import { getWeb3 } from 'src/logic/wallets/getWeb3'

const createERC20TokenContract = (tokenAddress: string): any => {
  const web3 = getWeb3()
  return new web3.eth.Contract(ERC20Contract.abi as any[], tokenAddress) as unknown as any
}

const createERC721TokenContract = (tokenAddress: string): any => {
  const web3 = getWeb3()
  return new web3.eth.Contract(ERC721Contract.abi as any[], tokenAddress) as unknown as any
}

export const getERC20TokenContract = createERC20TokenContract

export const getERC721TokenContract = createERC721TokenContract
