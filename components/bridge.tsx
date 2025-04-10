import { getDeployments } from '@tari-project/wxtm-bridge-contracts/deployments'

const Bridge = () => {
  const deployments = getDeployments(11155111)
  const wXTM = deployments.wXTM
  const wXTMBridge = deployments.wXTMBridge

  return (
    <section>
      <div className="flex flex-col">
        <div>wXTM Address: {wXTM}</div>
        <div>wXTMBridge: {wXTMBridge}</div>
      </div>
      bridge
    </section>
  )
}

export default Bridge
