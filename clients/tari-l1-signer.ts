import {
  TariL1SignerParameters,
  SignerMethodNames,
  SignerRequest,
  SignerResponse,
  SignerReturnType,
  AccountData,
  WalletBalance,
} from '../types/tapplet'

export interface SendOneSidedRequest {
  amount: string
  address: string
  paymentId?: string
}

export interface BridgeTxDetails {
  amount: string
  amountToReceive: string
  destinationAddress: string
  paymentId: string
}

export interface BridgeEnvs {
  walletconnect_id: string
  backend_api: string
}

export class TariL1Signer {
  public signerName = 'TariL1Signer'
  private __id = 0

  public constructor(public params: TariL1SignerParameters) {
    const filterResizeEvent = function (event: MessageEvent) {
      if (event.data && event.data.type === 'resize') {
        const resizeEvent = new CustomEvent('resize', {
          detail: { width: event.data.width, height: event.data.height },
        })
        window.dispatchEvent(resizeEvent)
      }
    }
    window.addEventListener(
      'message',
      (event) => filterResizeEvent(event),
      false,
    )
  }

  private async sendRequest<MethodName extends SignerMethodNames>(
    req: Omit<SignerRequest<MethodName>, 'id'>,
  ): Promise<SignerReturnType<MethodName>> {
    const id = ++this.__id
    return sendSignerCall(req, id)
  }

  /**
   * @description check if Tari Signer is connected with the Tari Universe
   * @returns true or false
   */
  public async isConnected(): Promise<boolean> {
    return this.sendRequest({
      methodName: 'isConnected',
      args: [],
    })
  }

  /**
   * @description get Tari Account details
   * @returns account data
   */
  public async getAccount(): Promise<AccountData> {
    const resp = await this.sendRequest({
      methodName: 'getAccount',
      args: [],
    })

    return {
      account_id: resp?.account_id ?? 0,
      address: resp?.address ?? '',
    }
  }

  /**
   * @description send XTM via one-sided transaction
   * @param amount XTM amount (uT or T)
   * @param address Tari Address one-sided
   * @param paymentId (optional) payment-id
   * @returns true if tx success; otherwise false
   */
  public async sendOneSided({
    amount,
    address,
    paymentId,
  }: SendOneSidedRequest): Promise<boolean> {
    return this.sendRequest({
      methodName: 'sendOneSided',
      args: [{ amount, address, paymentId }],
    })
  }

  /**
   * @description get Tari Account balance
   * @returns XTM amount
   */
  public async getTariBalance(): Promise<WalletBalance> {
    return this.sendRequest({
      methodName: 'getTariBalance',
      args: [],
    })
  }

  /**
   * @description add to TU store pending transaction
   * @returns true or false
   */
  public async addPendingTappletTx(tx: BridgeTxDetails): Promise<boolean> {
    return this.sendRequest({
      methodName: 'addPendingTappletTx',
      args: [tx],
    })
  }

  /**
   * @description check if there is any pending transaction
   * @returns true or false
   */
  public async getPendingTappletTx(): Promise<BridgeTxDetails | undefined> {
    return this.sendRequest({
      methodName: 'getPendingTappletTx',
      args: [],
    })
  }

  /**
   * @description check if there is any pending transaction
   * @returns true or false
   */
  public async removePendingTappletTx(paymentId: string): Promise<boolean> {
    return this.sendRequest({
      methodName: 'removePendingTappletTx',
      args: [paymentId],
    })
  }

  /**
   * @description get Tari Universe language
   * @returns app language
   */
  public async getAppLanguage(): Promise<string | undefined> {
    return this.sendRequest({
      methodName: 'getAppLanguage',
      args: [],
    })
  }

  /**
   * @description get bridge envs for different environments
   * @returns bridge envs
   */
  public async getBridgeEnvs(): Promise<[string, string] | undefined> {
    return this.sendRequest({
      methodName: 'getBridgeEnvs',
      args: [],
    })
  }
}

function sendSignerCall<MethodName extends SignerMethodNames>(
  req: Omit<SignerRequest<MethodName>, 'id'>,
  id: number,
): Promise<SignerReturnType<MethodName>> {
  return new Promise<SignerReturnType<MethodName>>((resolve, reject) => {
    const event_ref = (resp: MessageEvent<SignerResponse<MethodName>>) => {
      if (resp.data.resultError) {
        window.removeEventListener('message', event_ref)
        reject(resp.data.resultError)
      }
      if (
        resp &&
        resp.data &&
        resp.data.id &&
        resp.data.id === id &&
        resp.data.type === 'signer-call'
      ) {
        window.removeEventListener('message', event_ref)
        resolve(resp.data.result)
      }
    }

    window.addEventListener('message', event_ref, false)

    window.parent.postMessage({ ...req, id, type: 'signer-call' }, '*')
  })
}

export default TariL1Signer
