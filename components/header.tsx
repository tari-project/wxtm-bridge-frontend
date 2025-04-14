'use client'

const Navbar = () => {
  return (
    <header className="flex flex-col h-20 items-center justify-between py-6 gap-4 bg-transparent">
      <h2 className="text-sm font-semibold p-2 bg-black rounded-3xl text-white">
        Tari Bridge
      </h2>
      <div className="max-w-[35rem] text-wrap text-center">
        Move your XTM with infinite possibilities. We&apos;ll wrap your XTM
        allowing you to exchange your XTM any way you&apos;d like
      </div>
    </header>
  )
}

export default Navbar
