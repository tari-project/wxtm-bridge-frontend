'use client'

import React from 'react'
import { ModalButton } from './modals/modal-button'

type TmpProps = {
  onSuccess: () => void
}

const Tmp: React.FC<TmpProps> = ({ onSuccess }) => {
  return (
    <section className="mt-20 w-40 flex justify-center items-center">
      <ModalButton
        label="Success!"
        onClick={() => {
          onSuccess()
        }}
        disabled={false}
      />
    </section>
  )
}

export default Tmp
