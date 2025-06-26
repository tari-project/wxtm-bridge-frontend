import { memo, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import {
  BridgeBaseItemProps,
  BridgeHistoryListItemProps,
} from '@/types/transactions'
import {
  BlockInfoWrapper,
  Chip,
  Content,
  ContentWrapper,
  CurrencyText,
  ItemWrapper,
  StatusContent,
  StatusWrapper,
  TimeWrapper,
  TitleWrapper,
  ValueChangeWrapper,
  ValueWrapper,
} from './ListItem.styles'
import { useTranslation } from 'react-i18next'
import { formatNumber, FormatPreset } from '@/utils/formatters'
import {
  formatTimeStamp,
  getTimestampFromTransaction,
  getStatusInfo,
} from './helpers'
import { Button } from '@mui/material'
import BridgeItemHover from './BridgeHoveredItem'
import { truncateMiddle } from '@/utils/truncateString'
import useAppStore from '@/store/app'
import { BsQuestionCircleFill } from 'react-icons/bs'

const BaseItem = memo(function BaseItem({
  title,
  time,
  value,
  chip,
  onClick,
  status,
}: BridgeBaseItemProps) {
  // note re. isPositiveValue:
  // amounts in the tx response are always positive numbers but
  // if the transaction is Outbound, the value is negative

  const displayTitle = title.length > 26 ? truncateMiddle(title, 8) : title
  return (
    <ContentWrapper onClick={onClick}>
      <Content>
        <BlockInfoWrapper>
          <TitleWrapper title={title}>{displayTitle}</TitleWrapper>
          <TimeWrapper variant="p">{time}</TimeWrapper>
        </BlockInfoWrapper>
      </Content>

      <BlockInfoWrapper>
        <Content>
          <div className="mr-1">
            {chip ? (
              <Chip>
                <span>{chip}</span>
              </Chip>
            ) : null}
          </div>

          <ValueWrapper>
            <ValueChangeWrapper
              $isPositiveValue={false}
            >{`-`}</ValueChangeWrapper>
            {value}
            <CurrencyText>{`XTM`}</CurrencyText>
          </ValueWrapper>
        </Content>
        <div className="flex justify-end">
          <StatusWrapper $status={getStatusInfo(status).statusType}>
            <StatusContent>{getStatusInfo(status).text}</StatusContent>
          </StatusWrapper>
        </div>
      </BlockInfoWrapper>
    </ContentWrapper>
  )
})

const HistoryBaseItem = memo(function HistoryBaseItem({
  title,
  time,
  value,
  onClick,
  status,
  address,
}: BridgeBaseItemProps) {
  const displayTitle = title.length > 26 ? truncateMiddle(title, 8) : title
  const displayAddress = address ? truncateMiddle(address, 6) : ''

  return (
    <div
      onClick={onClick}
      className="w-full px-3 flex flex-row items-center h-full text-xs font-[510]"
    >
      <div className="flex-1 flex items-center">
        <TitleWrapper title={title}>{displayTitle}</TitleWrapper>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <TimeWrapper variant="p">{time}</TimeWrapper>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <ValueWrapper>
          <ValueChangeWrapper
            $isPositiveValue={false}
          >{`-`}</ValueChangeWrapper>
          {value}
          <CurrencyText>{`XTM`}</CurrencyText>
        </ValueWrapper>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {displayAddress}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <StatusWrapper $status={getStatusInfo(status).statusType}>
          {getStatusInfo(status).showIcon ? (
            <StatusContent>
              <span>{getStatusInfo(status).text}</span>
              <BsQuestionCircleFill size={12} />
            </StatusContent>
          ) : (
            getStatusInfo(status).text
          )}
        </StatusWrapper>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <button className="hover:text-blue-800 underline">
          View on block explorer
        </button>
      </div>
    </div>
  )
})

const BridgeHistoryListItem = memo(function ListItem({
  item,
  index,
  itemIsNew = false,
  setDetailedTx,
  isHistoryList = false,
}: BridgeHistoryListItemProps & { isHistoryList?: boolean }) {
  const { t } = useTranslation('wallet')
  const hideWalletBalance = useAppStore((s) => s.hideWalletBalance)

  const ref = useRef<HTMLDivElement>(null)

  const [hovering, setHovering] = useState(false)

  const earningsFormatted = hideWalletBalance
    ? `***`
    : formatNumber(
        Number(item.tokenAmount),
        FormatPreset.XTM_COMPACT,
      ).toLowerCase()
  const time = formatTimeStamp(getTimestampFromTransaction(item))

  const baseItem = isHistoryList ? (
    <HistoryBaseItem
      title={'Bridge XTM to WXTM'}
      time={time}
      value={earningsFormatted}
      status={item?.status}
      address={item?.sourceAddress || item?.destinationAddress}
    />
  ) : (
    <BaseItem
      title={'Bridge XTM to WXTM'}
      time={time}
      value={earningsFormatted}
      status={item?.status}
      chip={itemIsNew ? t('new') : ''}
    />
  )

  const detailsButton = (
    <Button
      variant="outlined"
      onClick={(e) => {
        e.stopPropagation()
        setDetailedTx?.({ ...item, createdAt: time })
      }}
    >
      {t(`history.view-details`)}
    </Button>
  )

  return (
    <ItemWrapper
      ref={ref}
      data-index={index}
      style={{ height: 48 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <AnimatePresence>
        {hovering && <BridgeItemHover button={detailsButton} />}
      </AnimatePresence>
      {baseItem}
    </ItemWrapper>
  )
})

export { BridgeHistoryListItem }
