export interface CheckboxProps {
  label: string
  value: boolean
  onChange: React.ChangeEventHandler<HTMLInputElement>
  hoverHint?: string
}
export function Checkbox({ label, value, onChange, hoverHint }: CheckboxProps) {
  return (
    <label title={hoverHint}>
      <input type='checkbox' checked={value} onChange={onChange} className='mr-1' />
      {label}
    </label>
  )
}
