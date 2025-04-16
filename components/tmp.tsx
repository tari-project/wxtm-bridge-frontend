'use client'

import React from 'react'
import Button from './button'

type TmpProps = {
  onSuccess: () => void
}

const Tmp: React.FC<TmpProps> = ({ onSuccess }) => {
  return (
    <section className="mt-20 w-40">
      <Button
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
