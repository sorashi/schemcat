import { CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { getIdentifierById, getIdentifiersByIds, StoreModel, useStore } from '../hooks/useStore'
import { ErNode as ErNodeModel, ErNodeType } from '../model/DiagramModel'
import SvgDiamondShape from './SvgDiamondShape'
import isEqual from 'react-fast-compare'

interface ErNodeProps {
  node: ErNodeModel
  height?: number
  selected: boolean
}

const defaultNodeStyle = {
  fill: 'white',
  stroke: 'black',
  strokeWidth: 1.5,
}

const selectedNodeStyle = {
  stroke: 'green',
  strokeDasharray: '3,3',
}

function ErNodeByType(props: ErNodeProps) {
  const { node, selected } = props
  const { width } = node
  const connections = useStore(
    useCallback(
      (state: StoreModel) => state.diagram.links.filter((x) => x.fromId === node.id || x.toId === node.id),
      [node.id]
    )
  )
  const nodes = useStore((state: StoreModel) => state.diagram.nodes)
  const identifiers = useStore((state: StoreModel) => state.diagram.identifiers)
  const circleConditionalStyle: Record<string, unknown> = useMemo(() => {
    return connections.some((x) =>
      Array.from((nodes.find((y) => y.id === x.toId || y.id === x.fromId) as ErNodeModel).identifiers).some(
        (identifierId) => isEqual(getIdentifierById(identifierId, identifiers).identities, new Set([node.id]))
      )
    )
      ? { fill: 'black' }
      : {}
  }, [connections, nodes, node.id, identifiers])
  switch (node.type) {
    case ErNodeType.EntityType:
      return (
        <rect
          width={width}
          height={node.height}
          y={0}
          x={0}
          rx={2}
          {...defaultNodeStyle}
          {...(selected && selectedNodeStyle)}
        />
      )
    case ErNodeType.AttributeType:
      return (
        <circle
          r={7}
          cx={0}
          cy={0}
          {...defaultNodeStyle}
          {...(selected && selectedNodeStyle)}
          {...circleConditionalStyle}
        />
      )
    case ErNodeType.RelationshipType:
      return (
        <SvgDiamondShape
          width={width}
          height={node.height}
          {...defaultNodeStyle}
          {...(selected && selectedNodeStyle)}
        />
      )
    default:
      console.error(`Unknown node type: ${node.type}`)
      return <rect width={width} height={node.height} {...defaultNodeStyle} />
  }
}

function ErNode(props: ErNodeProps) {
  const { node } = props
  const updateNodeById = useStore((state: StoreModel) => state.updateNodeById)
  const textRef = useRef<SVGTextElement>(null)
  useLayoutEffect(() => {
    if (textRef.current !== null) {
      const width = Math.max(textRef.current.clientWidth, 80)
      const height = Math.max(textRef.current.clientHeight, 35)
      let marginW = 0
      let marginH = 0
      if (node.type == ErNodeType.EntityType) {
        marginW = 20
        marginH = 20
      }
      updateNodeById(props.node.id, (node) => {
        node.width = width + marginW
        node.height = height + marginH
      })
    }
  }, [textRef.current?.clientWidth, textRef.current?.clientHeight])
  return (
    <>
      <ErNodeByType {...props} />
      <text
        x={props.node.width / 2}
        y={props.node.height / 2}
        ref={textRef}
        dominantBaseline='middle'
        textAnchor='middle'>
        {node.label}
      </text>
    </>
  )
}

export default ErNode
