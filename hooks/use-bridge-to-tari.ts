import { useReadContract, useWriteContract } from 'wagmi'
import { getDeployments } from '@tari-project/wxtm-bridge-contracts/deployments'
import {
  WXTM__factory,
  WXTMBridge__factory,
} from '@tari-project/wxtm-bridge-contracts/typechain/factories/contracts'
import { writeContract } from 'viem/actions'

export const useBridgeToTari = () => {
  const { writeContract, isPending, isSuccess, isError, error } =
    useWriteContract()

  const bridgeToTari = async (
    amount: string,
    ethAddress: `0x${string}`,
    tariAddress: string,
  ) => {
    try {
      const deployments = getDeployments(11155111)

      const wXTMAddress = deployments.wXTM
      const wXTMBridgeAddress = deployments.wXTMBridge

      const wXTMAbi = WXTM__factory.abi
      const wXTMBridgeAbi = WXTMBridge__factory.abi

      const value = BigInt(amount)

      console.debug(`[ TAPPLET-BRIDGE ] Processing approve...`)

      const txHash = writeContract({
        address: wXTMAddress,
        abi: wXTMAbi,
        functionName: 'approve',
        args: [wXTMBridgeAddress, value],
      })

      console.debug(
        `[ TAPPLET-BRIDGE ] Approve Called with: ${value}, ${ethAddress}, txHash: ${txHash}`,
      )
    } catch (err) {
      console.debug(`[ TAPPLET-BRIDGE ] Error while approving: ${err}`)
    }
    // const handleBridge = () => {
    //   writeContract({
    //     address: wXTMBridgeAddress,
    //     abi: wXTMBridgeAbi,
    //     functionName: 'bridgeToTari',
    //     args: [tariAddress, value],
    //   })

    //   console.debug(
    //     `[ TAPPLET-BRIDGE ] Bridge To Tari Called with: ${value}, ${tariAddress}`,
    //   )

    // }

    //   // For reading contract data (free)
    //   const readContract = useReadContract({
    //     address: "0xYourContractAddress",
    //     abi: yourContractABI,
    //     functionName: "yourReadFunction"
    //   });

    //   // For writing to contract (requires gas)
    //   const { writeContract, isSuccess, isPending, error } = useWriteContract();
  }

  return { bridgeToTari }
}
