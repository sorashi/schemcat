import { useStore, useValidtaionStore } from '../hooks/useStore'

export function Validations() {
  const diagram = useStore((state) => state.diagram)
  const dependencyCycle = useValidtaionStore((state) => state.dependencyCycle)

  const leaves = useValidtaionStore((state) => state.leaves)
  const leafNodesWithoutIdentifiers = diagram.nodes
    .filter((x) => leaves.some((l) => l == x.id))
    .filter((n) => n.identifiers.size == 0)

  return (
    <div className='w-full h-full'>
      {dependencyCycle && <ValidationError message='Dependency cycle detected in ER.'></ValidationError>}
      {leafNodesWithoutIdentifiers.map((n) => (
        <ValidationError
          key={`validation-${n.id}-no-ident`}
          message={`Entity Type with id ${n.id} (${n.label}) has no identifier. It must have at least one.`}></ValidationError>
      ))}
    </div>
  )
}

interface ValidationErrorProps {
  message: string
}
export function ValidationError({ message }: ValidationErrorProps) {
  return <div className='w-full bg-red-300 p-0 pl-3 border border-red-900 mb-1'>{message}</div>
}
