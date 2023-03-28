export interface CheckboxProps {
  label: string
  value: boolean
  onChange: React.ChangeEventHandler<HTMLInputElement>
  hoverHint?: string
  disabled?: boolean
}
export function Checkbox({ label, value, onChange, hoverHint, disabled }: CheckboxProps) {
  return (
    <label title={hoverHint}>
      <input type='checkbox' checked={value} onChange={onChange} className='mr-1' disabled={disabled} />
      {label}
    </label>
  )
}
