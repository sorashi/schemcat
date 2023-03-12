export interface CheckboxProps {
  label: string
  value: boolean
  onChange: React.ChangeEventHandler<HTMLInputElement>
}
export function Checkbox({ label, value, onChange }: CheckboxProps) {
  return (
    <label>
      <input type='checkbox' checked={value} onChange={onChange} className='mr-1' />
      {label}
    </label>
  )
}
