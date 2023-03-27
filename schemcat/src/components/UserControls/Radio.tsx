export interface RadioProps {
  className?: string
  options: string[]
  defaultValue: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  name: string
}

export function Radio({ className, options, defaultValue, onChange, name }: RadioProps) {
  return (
    <div className={className}>
      {options.map((x) => {
        const id = `${name}-${x}`
        return (
          <div key={`radio-option-${x}`}>
            <input
              defaultValue={x}
              defaultChecked={defaultValue === x}
              type='radio'
              name={name}
              id={id}
              onChange={onChange}
            />
            <label htmlFor={id} className='ml-1'>
              {x}
            </label>
          </div>
        )
      })}
    </div>
  )
}
