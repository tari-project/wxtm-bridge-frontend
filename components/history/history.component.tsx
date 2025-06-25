'use client'

import React, { useEffect, useRef, useState } from 'react'

import useTariAccountStore from '@/store/account'

import { useTranslation } from 'react-i18next'
import { BridgeHistoryListItem } from '../transactions/BridgeListItem'
import {
  HistoryListWrapper,
  ListItemWrapper,
  ListWrapper,
} from '../transactions/ListItem.styles'

export const TransactionHistory: React.FC = ({}) => {
  const bridgeTxs = useTariAccountStore((s) => s.backendBridgeTxs)
  const setDetailedTx = useTariAccountStore((s) => s.setDetailedTx)
  const targetRef = useRef<HTMLDivElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const { t } = useTranslation('main', { useSuspense: false })

  useEffect(() => {
    const el = targetRef.current
    if (!el) return
    const onScroll = () => setIsScrolled(el.scrollTop > 1)
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const listMarkup = (
    <ListItemWrapper>
      {bridgeTxs?.map((tx, i) => {
        return (
          <BridgeHistoryListItem
            key={tx.createdAt}
            item={tx}
            index={i}
            itemIsNew={i === 0}
            setDetailedTx={setDetailedTx}
            isHistoryList={true}
          />
        )
      })}
    </ListItemWrapper>
  )

  const emptyState = (
    <div className="flex flex-col items-center justify-center h-full min-h-[40px] text-center leading-[200%] tracking-[-2%]">
      <h3 className="text-sm font-medium text-black">
        {t('no_transactions_found_yet')}!
      </h3>
      <p className="text-sm font-medium text-[#797979] mt-2">
        {t('start_bridging_to_view')}.
      </p>
    </div>
  )

  return (
    <div className="bg-white/50 backdrop-blur-sm shadow-xl rounded-2xl p-4 mx-auto min-h-[130px] fixed-box mb-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full flex flex-col p-1">
          <div className="relative">
            <div className="flex items-center justify-center"></div>
            <HistoryListWrapper ref={targetRef}>
              <ListWrapper>
                {bridgeTxs && bridgeTxs.length > 0 ? listMarkup : emptyState}
              </ListWrapper>
            </HistoryListWrapper>
          </div>
        </div>
      </div>
    </div>
  )
}
