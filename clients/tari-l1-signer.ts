import {
  TariL1SignerParameters,
  SignerMethodNames,
  SignerRequest,
  SignerResponse,
  SignerReturnType,
  AccountData,
} from '../types/tapplet'

export type SendOneSidedRequest = {
  amount: string
  address: string
  message?: string
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

  public async isConnected(): Promise<boolean> {
    return this.sendRequest({
      methodName: 'isConnected',
      args: [],
    })
  }

  // TODO what do we need as response?
  public async getAccount(): Promise<AccountData> {
    // TODO implement in TU
    const resp = await this.sendRequest({
      methodName: 'getAccount',
      args: [],
    })

    return {
      account_id: resp.account_id,
      address: resp.address,
    }
  }

  /**
   *
   * @description send XTM via one-sided transaction
   * @param amount XTM amount (uT or T)
   * @param address Tari Address one-sided
   * @param message (optional) payment-id
   * @returns
   */
  public async sendOneSided({
    amount,
    address,
    message,
  }: SendOneSidedRequest): Promise<void> {
    return this.sendRequest({
      methodName: 'sendOneSided',
      args: [{ amount, address, message }],
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
