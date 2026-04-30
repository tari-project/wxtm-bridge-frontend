'use client'

import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useTariAccountStore, setDetailedTx } from '@/store/account'


import { BridgeHistoryListItem } from '../transactions/BridgeListItem'
import FolderIcon from './FolderIcon';
import { HistoryListWrapper, ListItemWrapper, ListWrapper } from '../transactions/ListItem.styles'

export const TransactionHistory = () => {
  const bridgeTxs = useTariAccountStore((s) => s.combinedBridgeTxs)
  const targetRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()





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
    <div className="flex flex-col items-center justify-center h-full min-h-[40px] text-center leading-[150%] tracking-[-2%]">      <FolderIcon aria-hidden="true" />      <h3 className="text-sm font-medium text-black mt-4">{t('emptyState.history.title')}</h3>
      <p className="text-sm font-medium text-[#797979] mt-2">{t('emptyState.history.description')}</p>
    </div>
  )

  return (
    <div className="bg-white/50 backdrop-blur-sm shadow-xl rounded-2xl p-4 mx-auto min-h-fit fixed-box mb-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full flex flex-col p-1">
          <div className="relative">
            <div className="flex items-center justify-center"></div>
            <HistoryListWrapper ref={targetRef}>
              <ListWrapper>{bridgeTxs && bridgeTxs.length > 0 ? listMarkup : emptyState}</ListWrapper>
            </HistoryListWrapper>
          </div>
        </div>
      </div>
    </div>
  )
}
