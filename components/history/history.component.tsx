'use client'

import React, { useEffect, useRef, useState } from 'react'

import useTariAccountStore from '@/store/account'

import { BridgeHistoryListItem } from '../transactions/BridgeListItem'
import {
  HistoryListWrapper,
  ListItemWrapper,
  ListWrapper,
} from '../transactions/ListItem.styles'

export const TransactionHistory: React.FC = ({}) => {
  const bridgeTxs = useTariAccountStore((s) => s.backendBridgeTxs)
  const setDetailsItem = useTariAccountStore((s) => s.setDetailsItem)
  const targetRef = useRef<HTMLDivElement>(null)
  const [isScrolled, setIsScrolled] = useState(false)

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
            setDetailsItem={setDetailsItem}
          />
        )
      })}
    </ListItemWrapper>
  )
  return (
    <div className="bg-white/50 backdrop-blur-sm shadow-xl rounded-2xl p-4 mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full flex flex-col p-1">
          <div className="relative">
            <div className="flex items-center justify-center"></div>
            <HistoryListWrapper ref={targetRef}>
              <ListWrapper>{listMarkup}</ListWrapper>
            </HistoryListWrapper>
          </div>
        </div>
      </div>
    </div>
  )
}
