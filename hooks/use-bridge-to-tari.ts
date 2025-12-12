import useTariAccountStore from '@/store/account'
import { parseWxtmTokenAmount } from '@/utils/parse-wxtm-token-amount'
import { TokensUnwrappedService, UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'
import {
  DeployedChains,
  getDeployments,
} from '@tari-project/wxtm-bridge-contracts/deployments'
import {
  WXTM__factory,
  WXTMBridge__factory,
} from '@tari-project/wxtm-bridge-contracts/typechain/factories/contracts'
import { ethers } from 'ethers'
import { useReadContract, useWalletClient, useWriteContract } from 'wagmi'

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

  const setLastOngoingBridgeTx = useTariAccountStore(
    (s) => s.setLastOngoingBridgeTx,
  )

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
      const limitMicro = await TokensUnwrappedService.getRemainingDailyLimit()
      const limitXtm = Number(BigInt(limitMicro) / BigInt(1_000_000))
      
      const amountNum = parseFloat(amount)
      
      if (amountNum > limitXtm) {
        console.error(`[ TAPPLET-BRIDGE ] Daily limit exceeded. Limit: ${limitXtm}, Amount: ${amountNum}`)
        return false 
      }

      const value = BigInt(ethers.utils.parseEther(amount).toString())

      const now = Math.floor(Date.now() / 1000)
      const validAfter = BigInt(now)
      const validBefore = BigInt(now + 3600) // 1 hour

      const authNonce = ethers.utils.hexlify(ethers.utils.randomBytes(32))

      const { v, r, s } = await generateAuthorizationSignature(
        ethAddress,
        wXTMBridgeAddress,
        value,
        validAfter,
        validBefore,
        authNonce,
      )

      console.debug(`[ TAPPLET-BRIDGE ] Processing bridge to Tari...`)

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
        `[ TAPPLET-BRIDGE ] Bridge transaction executed with txHash: ${txHash}, amount: ${value}`,
      )

      const amountAfterFee =
        (value * ethers.utils.parseUnits('0.995', 18).toBigInt()) / BigInt(1e18)

      // set ongoing to immediately display wrap modal
      setLastOngoingBridgeTx({
        destinationAddress: tariAddress,
        tokenAmount: parseWxtmTokenAmount(amount),
        amountAfterFee: parseWxtmTokenAmount(
          ethers.utils.formatEther(amountAfterFee.toString()),
        ),
        status: UserTransactionDTO.status.PENDING,
        createdAt: new Date().toISOString(),
        paymentId: '',
        showModal: true,
        type: 'unwrap',
      })

      return true
    } catch (err) {
      console.error(`[ TAPPLET-BRIDGE ] Error in bridge process: ${err}`)
      return false
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
