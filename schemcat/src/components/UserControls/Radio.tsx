export interface RadioProps {
  className?: string
  options: string[]
  defaultValue: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

export function Radio({ className, options, defaultValue, onChange }: RadioProps) {
  return (
    <div className={className}>
      {options.map((x) => (
        <div key={`radio-option-${x}`}>
          <input defaultValue={x} defaultChecked={defaultValue === x} type='radio' onChange={onChange} />
          <label className='ml-1'>{x}</label>
        </div>
      ))}
    </div>
  )
}
