export interface ColorSelectProps {
  defaultValue?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
}

export function ColorSelect(props: ColorSelectProps) {
  return (
    <input
      type='color'
      defaultValue={props.defaultValue}
      className='align-middle h-5'
      onChange={props.onChange}></input>
  )
}
