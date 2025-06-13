import styled from 'styled-components'

import { m } from 'motion/react'
import { UserTransactionDTO } from '@tari-project/wxtm-bridge-backend-api'

export const StatusValue = styled.div<{ $status?: UserTransactionDTO.status }>`
  font-family: Poppins;
  font-weight: bold;
  font-size: 14px;
  line-height: 117%;
  letter-spacing: -3%;
  color: ${({ $status: status }) => {
    switch (status) {
      case 'SUCCESS':
        return '#36C475'
      case 'TIMEOUT':
        return '#ff0000'
      default:
        return '#000000'
    }
  }};
`

export const ProcessingDetailsWrapper = styled.div`
  padding: 20px;
`

export const OfficialContractAddressConainer = styled.div`
  background: #fff;
  padding: 15px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const OfficialContractAddressWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  .label {
    font-size: 12px;
    color: #000000;
  }
  .address {
    font-size: 14px;
    font-weight: 500;
    color: #090719;
  }
`

export const CopyIconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: visible;
  transition: all 0.2s ease-in-out;
  &:hover {
    scale: 1.1;
  }
`

export const CopyText = styled(m.div)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 26px;
  border-radius: 15px;
  background: #36c475;
  color: white;
  padding: 0 10px;
  z-index: 1;
`

export const HelperText = styled.div`
  background: #e6fff6;
  border: 1px solid #06c983;
  padding: 15px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  font-size: 12px;

  color: #126537;
  .strong {
    font-weight: bold;
  }
  .btn {
    cursor: pointer;
    text-decoration: underline;
    font-weight: bold;
  }
`
