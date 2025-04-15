'use client'

import React, { useState } from 'react'
import MainModal from '@/components/main-modal'

export default function Home() {
  const [modalOpen, setModalOpen] = useState<boolean>(true)

  return (
    <main className="flex flex-col items-center justify-center">
      {modalOpen && <MainModal setModalOpen={setModalOpen} />}
    </main>
  )
}
