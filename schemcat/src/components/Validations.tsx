import { useValidtaionStore } from '../hooks/useStore'

export function Validations() {
  const dependencyCycle = useValidtaionStore((state) => state.dependencyCycle)
  return (
    <div className='w-full h-full'>
      {dependencyCycle && <ValidationError message='Dependency cycle detected in ER.'></ValidationError>}
    </div>
  )
}

interface ValidationErrorProps {
  message: string
}
export function ValidationError({ message }: ValidationErrorProps) {
  return <div className='w-full bg-red-300 p-0 pl-3 border border-red-900 mb-1'>{message}</div>
}
