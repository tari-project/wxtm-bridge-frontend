import { useReadContract, useWriteContract } from 'wagmi'

export const useBridgeToTari = () => {
  const bridgeToTari = async () => {
    console.debug('[ TAPPLET-BRIDGE ] Bridge To Tari Called!')
  }

  //   // For reading contract data (free)
  //   const readContract = useReadContract({
  //     address: "0xYourContractAddress",
  //     abi: yourContractABI,
  //     functionName: "yourReadFunction"
  //   });

  //   // For writing to contract (requires gas)
  //   const { writeContract, isSuccess, isPending, error } = useWriteContract();

  //   const handleWriteSmartContract = () => {
  //     writeContract({
  //       address: "0xYourContractAddress",
  //       abi: yourContractABI,
  //       functionName: "yourWriteFunction",
  //       args: [arg1, arg2]
  //     });
  //   };

  return { bridgeToTari }
}
