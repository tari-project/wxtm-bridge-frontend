'use client'

import React, { useState } from 'react'
import MainModal from '@/components/main-modal'

/** @dev Temporary import */
import Tmp from '@/components/tmp'

export default function Home() {
  const [modalOpen, setModalOpen] = useState<boolean>(true)

  /** @dev Temporary solution to trigger success modal */
  const [success, setSuccess] = useState(false)

  return (
    <main className="flex flex-col items-center justify-center">
      <Tmp
        onSuccess={() => {
          setSuccess(true)
          setModalOpen(true)
        }}
      />
      {modalOpen && <MainModal setModalOpen={setModalOpen} success={success} />}
    </main>
  )
}
