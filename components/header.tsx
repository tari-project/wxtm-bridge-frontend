'use client'

const Navbar = () => {
  return (
    <header className="flex flex-col h-20 items-center justify-between py-6 gap-4">
      <h2 className="text-2xl font-semibold p-2 bg-black rounded-lg">
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
