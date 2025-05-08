import {
  AccountData,
  MinotariWalletSignerParameters,
  SignerMethodNames,
  SignerRequest,
  SignerResponse,
  SignerReturnType,
} from './types'

export type SendOneSidedRequest = {
  amount: number
  address?: string
  message?: string
}

export class MinotariWalletSigner {
  public signerName = 'MinotariWalletSigner'
  private __id = 0

  public constructor(public params: MinotariWalletSignerParameters) {
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

  public isConnected(): boolean {
    return true
  }

  // TODO what do we need?
  public async getAccount(): Promise<AccountData> {
    return {
      account_id: 0,
      address: 'placeholder',
    }
  }

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
