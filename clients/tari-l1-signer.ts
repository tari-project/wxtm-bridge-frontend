import { BackendBridgeTransaction } from '@/types/transactions'
import {
  TariL1SignerParameters,
  SignerMethodNames,
  SignerRequest,
  SignerResponse,
  SignerReturnType,
  AccountData,
  WalletBalance,
} from '../types/tapplet'
import { isFromUniverse, postToUniverse } from '@/utils/universe'
import { isTariAddress } from '@/utils/tari-address'
import { config } from '@/config'

export interface SendOneSidedRequest {
  amount: string
  address: string
  paymentId?: string
}

export interface BaseNodeStatus {
  sha_network_hashrate: number
  monero_randomx_network_hashrate: number
  tari_randomx_network_hashrate: number
  block_reward: number
  block_height: number
  block_time: number
  is_synced: boolean
  num_connections: number
  readiness_status: string
}

export interface BridgeTxDetails {
  amount: string
  amountToReceive: string
  destinationAddress: string
  paymentId: string
  // Set for Ootle wraps so a reload can finish the tokens-sent step. clientToken is a secret.
  network?: 'Ootle'
  chainId?: number
  clientToken?: string
  ootleTransactionId?: string
}

export class TariL1Signer {
  public signerName = 'TariL1Signer'

  public constructor(public params: TariL1SignerParameters) {
    const filterResizeEvent = function (event: MessageEvent) {
      if (isFromUniverse(event, ['resize'])) {
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
    const timeoutMs = req.methodName === 'sendOneSided' ? SIGNER_SEND_TIMEOUT_MS : undefined
    const result = await sendSignerCall(req.methodName, req.args, timeoutMs)
    // Universe reports unsupported methods and bad arguments as { error } in the result.
    if (typeof result === 'object' && result !== null && 'error' in result) {
      throw new SignerRefusedError(`Signer call ${req.methodName} refused: ${String(result.error)}`)
    }
    return result as SignerReturnType<MethodName>
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

    // The unwrap destination, so it must be a real Tari address.
    if (!isTariAddress(resp?.address)) throw new Error('Universe returned an invalid Tari address')
    return {
      account_id: resp.account_id ?? 0,
      address: resp.address,
    }
  }

  /**
   * @description send XTM via one-sided transaction
   * @param amount XTM amount (uT or T)
   * @param address Tari Address one-sided
   * @param paymentId (optional) payment-id
   * @returns true; throws if Universe did not send it
   */
  public async sendOneSided({
    amount,
    address,
    paymentId,
  }: SendOneSidedRequest): Promise<boolean> {
    const sent = await this.sendRequest({
      methodName: 'sendOneSided',
      args: [{ amount, address, paymentId }],
    })
    if (sent !== true) throw new Error('Universe did not send the transaction')
    return sent
  }

  /**
   * @description get Base Node status
   * @returns BaseNodeStatus
   */
  public async getBaseNodeStatus(): Promise<BaseNodeStatus> {
    return this.sendRequest({
      methodName: 'getBaseNodeStatus',
      args: [],
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
  public async setOngoingBridgeTx(tx: BridgeTxDetails): Promise<boolean> {
    return this.sendRequest({
      methodName: 'setOngoingBridgeTx',
      args: [tx],
    })
  }

  /**
   * @description check if there is any pending transaction
   * @returns true or false
   */
  public async getOngoingBridgeTx(): Promise<BridgeTxDetails | undefined> {
    return this.sendRequest({
      methodName: 'getOngoingBridgeTx',
      args: [],
    })
  }

  /**
   * @description check if there is any pending transaction
   * @returns true or false
   */
  public async removeOngoingBridgeTx(): Promise<boolean> {
    return this.sendRequest({
      methodName: 'removeOngoingBridgeTx',
      args: [],
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
  public async getBridgeEnvs(): Promise<[string, string]> {
    const envs: unknown = await this.sendRequest({
      methodName: 'getBridgeEnvs',
      args: [],
    })
    // The backend URL decides where deposits go, so only an https URL is accepted.
    if (!Array.isArray(envs) || envs.length !== 2 || typeof envs[0] !== 'string' || !isBackendApiUrl(envs[1])) {
      throw new Error('Universe returned invalid bridge envs')
    }
    return [envs[0], envs[1]]
  }

  /**
   * @description get Tari Account bridge transactions from backend
   * @returns Bridge transactions
   */
  public async getBackendBridgeTxs(): Promise<BackendBridgeTransaction[]> {
    return this.sendRequest({
      methodName: 'getBackendBridgeTxs',
      args: [],
    })
  }

  public async getNetwork(): Promise<string> {
    const network = await this.sendRequest({
      methodName: 'getNetwork',
      args: [],
    })
    if (!TARI_NETWORKS.includes(network)) throw new Error('Universe returned an unknown network')
    return network
  }
}

// Tari's Network::as_key_str values
const TARI_NETWORKS = ['mainnet', 'stagenet', 'nextnet', 'localnet', 'igor', 'esmeralda']

function isBackendApiUrl(value: unknown): value is string {
  let url: URL
  try {
    url = new URL(value as string)
  } catch {
    return false
  }
  if (url.protocol === 'https:') return true
  return config.UNIVERSE_DEV_BUILD && url.protocol === 'http:' && url.hostname === 'localhost'
}

// Every signer client shares this one postMessage channel. Ids are random so another frame can't guess
// them, only replies from Universe are accepted, and a reply settles only the call with its id.
type PendingCall = {
  resolve: (result: unknown) => void
  reject: (error: unknown) => void
  timer: ReturnType<typeof setTimeout>
}
const pendingCalls = new Map<string, PendingCall>()
let listening = false

function onSignerReply(event: MessageEvent<SignerResponse<SignerMethodNames>>) {
  if (!isFromUniverse(event, ['signer-call'])) return
  const call = pendingCalls.get(event.data.id)
  if (!call) return
  pendingCalls.delete(event.data.id)
  clearTimeout(call.timer)
  if (event.data.resultError) {
    call.reject(event.data.resultError)
  } else {
    call.resolve(event.data.result)
  }
}

// Universe didn't answer in time; the call may still have run there.
export class SignerTimeoutError extends Error {}
// Universe rejected the call ({ error } result: unsupported method or bad arguments) before running it.
export class SignerRefusedError extends Error {}

const SIGNER_CALL_TIMEOUT_MS = 60_000
// Sends wait for the user to enter their PIN in Universe.
export const SIGNER_SEND_TIMEOUT_MS = 10 * 60_000

export function sendSignerCall(
  methodName: string,
  args: unknown[],
  timeoutMs = SIGNER_CALL_TIMEOUT_MS,
): Promise<unknown> {
  if (!listening) {
    window.addEventListener('message', onSignerReply)
    listening = true
  }
  const id = crypto.randomUUID()
  return new Promise<unknown>((resolve, reject) => {
    const timer = setTimeout(() => {
      pendingCalls.delete(id)
      reject(new SignerTimeoutError(`Signer call ${methodName} timed out`))
    }, timeoutMs)
    pendingCalls.set(id, { resolve, reject, timer })
    postToUniverse({ methodName, args, id, type: 'signer-call' })
  })
}

export default TariL1Signer
