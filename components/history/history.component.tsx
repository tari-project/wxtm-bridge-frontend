'use client'

import React from 'react'

import useTariAccountStore from '@/store/account'

import { BridgeHistoryListItem } from '../transactions/BridgeListItem'
import { ListItemWrapper } from '../transactions/ListItem.styles'

export const TransactionHistory: React.FC = ({}) => {
  const bridgeTxs = useTariAccountStore((s) => s.backendBridgeTxs)
  const setDetailsItem = useTariAccountStore((s) => s.setDetailsItem)

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

        // If we reach here, it means the transaction is neither a TransactionInfo nor a UserTransactionDTO
        console.warn('Unexpected transaction type:', tx)
        return null // or handle accordingly
      })}

      {/* fill the list with placeholders if there are less than 4 entries */}
      {/* {Array.from({ length: placeholdersNeeded }).map((_, index) => (
        <PlaceholderItem key={`placeholder-${index}`} />
      ))}
      {isFetchingNextPage || isFetching ? <LoadingDots /> : null} */}
    </ListItemWrapper>
  )
  return (
    <div className="bg-white/50 backdrop-blur-sm shadow-xl rounded-2xl p-4 mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="w-full flex flex-col p-1">
          <div className="relative">
            <div className="flex items-center justify-center"></div>
            {listMarkup}
          </div>
        </div>
      </div>
    </div>
  )
}
