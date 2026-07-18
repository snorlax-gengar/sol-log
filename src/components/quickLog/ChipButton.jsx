function ChipButton({
  selected = false,
  onClick,
  children,
  className = '',
  disabled = false,
  type = 'button',
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center rounded-xl px-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? 'bg-[#3D8B5A] text-white shadow-sm'
          : 'bg-white text-stone-600 ring-1 ring-[#E8E2D9] hover:bg-[#E6F4EA]/60'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export default ChipButton
