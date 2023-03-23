import { ChangeEvent, useLayoutEffect, useRef, useState } from 'react'

interface EditableTextProps {
  onChange?: React.ChangeEventHandler<HTMLInputElement> // for now
  initialText: string
}

export function EditableText({ onChange, initialText }: EditableTextProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [size, setSize] = useState<number | undefined>(undefined)
  useLayoutEffect(() => {
    if (!inputRef.current) return
    inputRef.current.size = inputRef.current.value.length
  }, [inputRef.current?.value])
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (inputRef.current) setSize(Math.max(1, inputRef.current.value.length))
    if (onChange) onChange(e)
  }
  return (
    <input
      ref={inputRef}
      type='text'
      onChange={handleChange}
      defaultValue={initialText}
      size={size}
      className='focus:text-black text-gray-600 w-auto inline-block text-center'
    />
  )
}
