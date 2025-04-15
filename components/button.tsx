type ButtonProps = {
  label: string
  onClick: () => void
  disabled?: boolean
}

const Button = ({ label, onClick, disabled }: ButtonProps) => {
  return (
    <button
      className="group relative text-white flex m-auto justify-center items-center overflow-hidden w-full h-[3.9rem] bg-[#523DF1]
      hover:bg-[#3d5ef1] rounded-full hover:cursor-pointer"
      onClick={onClick}
      disabled={disabled}
    >
      {disabled ? (
        <div className="h-5 w-5 animate-spin rounded-full border-b-[3px] border-white"></div>
      ) : (
        <div className="text-[13px] font-semibold text-white group-hover:font-bold">
          {label}
        </div>
      )}
    </button>
  )
}

export default Button
