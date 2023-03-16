import { CSSProperties, useState } from 'react'
import { PortalDivInBody } from '../PortalDivInBody'

const transitionStyle: CSSProperties = { transition: 'visibility 0.4s, opacity 0.3s ease-in-out' }
interface DialogProps {
  children?: React.ReactNode
  visible: boolean
  onClosing?: (result: DialogResult) => void
  title?: string
}

export enum DialogResult {
  Ok,
  Cancel,
}

export function Dialog({ children, visible, onClosing, title = 'Title' }: DialogProps) {
  return (
    <PortalDivInBody>
      <div
        onClick={() => onClosing && onClosing(DialogResult.Cancel)}
        className={`w-[100vw] h-[100vh] bg-black backdrop-blur-sm bg-opacity-50 overflow-hidden absolute top-0 left-0 z-10 transition ${
          !visible ? 'opacity-0 pointer-events-none' : ''
        }`}
        style={transitionStyle}></div>
      <div
        className={`bg-white w-60 h-auto absolute z-20 rounded shadow top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] p-3 transition ${
          !visible ? 'opacity-0 pointer-events-none' : ''
        }`}
        style={transitionStyle}>
        <div className='flex justify-between'>
          <span className='text-xl font-bold'>{title}</span>
          <span className='cursor-pointer' onClick={() => onClosing && onClosing(DialogResult.Cancel)}>
            &times;
          </span>
        </div>
        <hr className='mb-3' />
        {children}
        <div className='flex justify-end gap-1 mt-3'>
          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline'
            type='button'
            onClick={() => onClosing && onClosing(DialogResult.Ok)}>
            OK
          </button>
          <button
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline'
            type='button'
            onClick={() => onClosing && onClosing(DialogResult.Cancel)}>
            Cancel
          </button>
        </div>
      </div>
    </PortalDivInBody>
  )
}
