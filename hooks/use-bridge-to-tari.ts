import { useReadContract, useWriteContract, useWalletClient } from 'wagmi'
import {
  getDeployments,
  DeployedChains,
} from '@tari-project/wxtm-bridge-contracts/deployments'
import {
  WXTM__factory,
  WXTMBridge__factory,
} from '@tari-project/wxtm-bridge-contracts/typechain/factories/contracts'
import { ethers } from 'ethers'

export const useBridgeToTari = (
  ethAddress: `0x${string}`,
  chain: DeployedChains,
) => {
  const deployments = getDeployments(chain)
  const wXTMAddress = deployments.wXTM
  const wXTMBridgeAddress = deployments.wXTMBridge
  const wXTMAbi = WXTM__factory.abi
  const wXTMBridgeAbi = WXTMBridge__factory.abi

  const { data: domainData } = useReadContract({
    address: wXTMAddress,
    abi: wXTMAbi,
    functionName: 'eip712Domain',
    args: [],
  })

  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract()

  const { data: signer } = useWalletClient({
    account: ethAddress,
    chainId: chain,
  })

  const generateAuthorizationSignature = async (
    from: string,
    to: string,
    value: bigint,
    validAfter: bigint,
    validBefore: bigint,
    nonce: string,
  ) => {
    if (!signer) {
      console.error(`[ TAPPLET-BRIDGE ] Failed getting signer!`)
      throw new Error('No signer available')
    }

    if (!domainData) {
      console.error(`[ TAPPLET-BRIDGE ] Domain data not available`)
      throw new Error('Domain data not available')
    }

    const domain = {
      name: domainData[1],
      version: domainData[2],
      chainId: chain,
      verifyingContract: wXTMAddress,
    }
    const types = {
      ReceiveWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' },
      ],
    }
    const message = {
      from,
      to,
      value: value,
      validAfter,
      validBefore,
      nonce,
    }

    const signature = await signer.signTypedData({
      domain,
      types,
      primaryType: 'ReceiveWithAuthorization',
      message,
    })
    const { v, r, s } = ethers.utils.splitSignature(signature)

    return { v, r, s }
  }

  const bridgeToTari = async (
    amount: string,
    ethAddress: `0x${string}`,
    tariAddress: string,
  ) => {
    try {
      const value = BigInt(ethers.utils.parseEther(amount).toString())

      const now = Math.floor(Date.now() / 1000)
      const validAfter = BigInt(now)
      const validBefore = BigInt(now + 3600) // 1 hour

      // Generate a random nonce
      const authNonce = ethers.utils.hexlify(ethers.utils.randomBytes(32))

      console.debug(
        `[ TAPPLET-BRIDGE ] Generating authorization signature... nonce: ${authNonce}, timestamp: ${validBefore}`,
      )

      // Generate the authorization signature
      const { v, r, s } = await generateAuthorizationSignature(
        ethAddress,
        wXTMBridgeAddress,
        value,
        validAfter,
        validBefore,
        authNonce,
      )

      console.debug(`[ TAPPLET-BRIDGE ] Authorization signature generated:`, {
        v,
        r,
        s,
      })

      console.debug(
        `[ TAPPLET-BRIDGE ] Processing bridgeToTariWithAuthorization...`,
      )

      const txHash = writeContract({
        address: wXTMBridgeAddress,
        abi: wXTMBridgeAbi,
        functionName: 'bridgeToTariWithAuthorization',
        args: [
          tariAddress,
          value,
          BigInt(validAfter),
          BigInt(validBefore),
          authNonce as `0x${string}`, // bytes32
          v,
          r as `0x${string}`,
          s as `0x${string}`,
        ],
      })

      console.debug(
        `[ TAPPLET-BRIDGE ] Bridge transaction initiated with txHash: ${txHash}, amount: ${value}`,
      )
    } catch (err) {
      console.error(`[ TAPPLET-BRIDGE ] Error in bridge process: ${err}`)
    }
  }

  return {
    bridgeToTari,
    isPending,
    isSuccess,
    isError,
    error,
  }
}
