import { ChangeEvent, useLayoutEffect, useRef, useState } from 'react'
import { isOnlyWhitespace } from '../utils/String'

interface EditableTextProps {
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  initialText: string
}

export function EditableText({ onChange, initialText }: EditableTextProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [size, setSize] = useState<number | undefined>(undefined)
  useLayoutEffect(() => {
    if (inputRef.current) setSize(Math.max(10, inputRef.current.value.length))
  }, [inputRef.current?.value])
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (inputRef.current) setSize(Math.max(10, inputRef.current.value.length))
    // ensure text is non-empty
    if (isOnlyWhitespace(e.target.value)) return
    if (onChange) onChange(e)
  }
  return (
    <input
      ref={inputRef}
      type='text'
      onChange={handleChange}
      defaultValue={initialText}
      placeholder={'Project Name'}
      size={size}
      className='focus:text-black text-gray-600 w-auto inline-block text-center'
    />
  )
}
