import React from 'react'

type WrappingModalProps = {
  closeModal: () => void
}

const WrappingModal: React.FC<WrappingModalProps> = ({ closeModal }) => {
  return (
    <div className="w-full flex flex-col p-6">
      <div className="mt-2">
        {/* Top Section */}
        <div className="flex justify-between items-center">
          <div className="">Some Clock</div>
        </div>
      </div>
    </div>
  )
}

export default WrappingModal
