/** Accessible on/off switch. */
export default function Switch({ checked, onChange, label, id, disabled = false, size = 'md' }) {
  const small = size === 'sm'
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        small ? 'h-6 w-11' : 'h-7 w-12'
      } ${checked ? 'bg-berry-deep' : 'bg-blush-deep'}`}
    >
      <span
        className={`inline-block rounded-full bg-white shadow transition-transform ${small ? 'size-5' : 'size-6'} ${
          checked ? (small ? 'translate-x-[1.375rem]' : 'translate-x-[1.375rem]') : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
