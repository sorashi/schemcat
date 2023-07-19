import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

interface ToggleButtonProps {
  isChecked: boolean
  label?: string
  onToggle?: (isChecked: boolean) => void
  className?: string
  defaultValue?: boolean
}

export function ToggleButton(props: ToggleButtonProps) {
  const [id] = useState(`toggle-btn-${uuidv4()}`)
  const [isChecked, setIsChecked] = useState(props.defaultValue || false)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setIsChecked(event.target.checked)
    if (props.onToggle) props.onToggle(event.target.checked)
  }

  return (
    <label htmlFor={id} className={`inline-flex relative items-center cursor-pointer ${props.className || ''}`}>
      <input
        type='checkbox'
        value=''
        id={id}
        className='sr-only peer'
        defaultChecked={isChecked}
        onChange={handleChange}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      {props.label && <span className='ml-3 text-sm font-medium text-gray-900'>{props.label}</span>}
    </label>
  )
}

ToggleButton.defaultProps = {
  isChecked: false,
}
