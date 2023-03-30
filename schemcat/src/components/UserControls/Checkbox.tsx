export interface CheckboxProps {
  label: string
  value: boolean
  onChange: React.ChangeEventHandler<HTMLInputElement>
  hoverHint?: string
  disabled?: boolean
  className?: string
}
export function Checkbox({ label, value, onChange, hoverHint, disabled, className }: CheckboxProps) {
  return (
    <label title={hoverHint} className={className}>
      <input type='checkbox' checked={value} onChange={onChange} className='mr-1' disabled={disabled} />
      {label}
    </label>
  )
}
