import { ethers } from "ethers";

export const balanceOfAbi = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];

export const fetchUserBalance = async (
  address: string,
  tokenAddress: string,
  provider: any
): Promise<number> => {
  try {
    const contract = new ethers.Contract(tokenAddress, balanceOfAbi, provider);
    const balance = await contract.balanceOf(address);
    return Number(ethers.utils.formatUnits(balance, 18)); // Assuming 18 decimals
  } catch (error) {
    console.warn(`Failed to fetch balance for ${address} on ${tokenAddress}:`, error);
    return 0;
  }
};
