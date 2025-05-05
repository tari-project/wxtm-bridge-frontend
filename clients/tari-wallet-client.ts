const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

//TODO replace with actual implementation
export const TariWalletClient = {
  transferTokensToColdWallet: async ({}: {
    amount: string
    paymentId: string
  }) => {
    await delay(2000)

    //TODO would be ideal if the client could return the transactionId/trasactionHash
    return { transactionId: '1234567890' }
  },
}
