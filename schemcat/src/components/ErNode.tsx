import React, { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { getIdentifierById, StoreModel, useStore } from '../hooks/useStore'
import { Anchor, ErNode as ErNodeModel, ErNodeType } from '../model/DiagramModel'
import SvgDiamondShape from './SvgDiamondShape'
import isEqual from 'react-fast-compare'
import { attributeCircleRadius, attributeLabelMargin, rectangleCornerRadius, strokeWidthThick } from '../Constants'
import { assertNever } from '../utils/Types'

interface ErNodeProps {
  node: ErNodeModel
  height?: number
  selected: boolean
  autoSize: boolean
}
interface ErLabelProps {
  node: ErNodeModel
}

const defaultNodeStyle = {
  fill: 'white',
  stroke: 'black',
  strokeWidth: strokeWidthThick,
}

const selectedNodeStyle = {
  stroke: 'green',
  strokeDasharray: '3,3',
}

function ErAttributeLabel({ node }: ErLabelProps) {
  switch (node.attributeTextPosition) {
    case Anchor.Top:
      return (
        <text
          x={0}
          y={-attributeCircleRadius - attributeLabelMargin}
          textAnchor='middle'
          dominantBaseline='auto'
          alignmentBaseline='baseline'>
          {node.label}
        </text>
      )
    case Anchor.Bottom:
      return (
        <text
          x={0}
          y={attributeCircleRadius + attributeLabelMargin}
          textAnchor='middle'
          dominantBaseline='hanging'
          alignmentBaseline='hanging'>
          {node.label}
        </text>
      )
    case Anchor.Center:
    case Anchor.Right:
      return (
        <text
          x={attributeCircleRadius + attributeLabelMargin}
          y={0}
          dominantBaseline='middle'
          alignmentBaseline='middle'
          textAnchor='start'>
          {node.label}
        </text>
      )
    case Anchor.Left:
      return (
        <text
          x={-attributeCircleRadius - attributeLabelMargin}
          y={0}
          dominantBaseline='middle'
          alignmentBaseline='middle'
          textAnchor='end'>
          {node.label}
        </text>
      )
    case Anchor.TopLeft:
      return (
        <text
          x={-attributeLabelMargin}
          y={-attributeLabelMargin}
          dominantBaseline='auto'
          alignmentBaseline='baseline'
          textAnchor='end'>
          {node.label}
        </text>
      )
    case Anchor.TopRight:
      return (
        <text
          x={attributeLabelMargin}
          y={-attributeLabelMargin}
          dominantBaseline='auto'
          alignmentBaseline='baseline'
          textAnchor='start'>
          {node.label}
        </text>
      )
    case Anchor.BottomLeft:
      return (
        <text
          x={-attributeLabelMargin}
          y={attributeLabelMargin}
          dominantBaseline='hanging'
          alignmentBaseline='hanging'
          textAnchor='end'>
          {node.label}
        </text>
      )
    case Anchor.BottomRight:
      return (
        <text
          x={attributeLabelMargin}
          y={attributeLabelMargin}
          dominantBaseline='hanging'
          alignmentBaseline='hanging'
          textAnchor='start'>
          {node.label}
        </text>
      )
    default:
      assertNever(node.attributeTextPosition)
  }
}

const ErLabelByType = React.forwardRef<SVGTextElement, ErLabelProps>(
  (props: ErLabelProps, textRef: React.ForwardedRef<SVGTextElement>) => {
    const { node } = props
    if (node.type === ErNodeType.AttributeType) {
      return <ErAttributeLabel node={node}></ErAttributeLabel>
    } else {
      return (
        <text
          x={props.node.width / 2}
          y={props.node.height / 2}
          ref={textRef}
          dominantBaseline='middle'
          textAnchor='middle'
          alignmentBaseline='middle'>
          {node.label}
        </text>
      )
    }
  }
)
ErLabelByType.displayName = 'ErLabelByType'

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
          rx={rectangleCornerRadius}
          {...defaultNodeStyle}
          {...(selected && selectedNodeStyle)}
        />
      )
    case ErNodeType.AttributeType:
      return (
        <circle
          r={attributeCircleRadius}
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
    if (textRef.current !== null && props.autoSize && props.node.id >= 0) {
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
      <ErLabelByType node={props.node} ref={textRef} />
    </>
  )
}
ErNode.defaultProps = { selected: false, autoSize: true }

export default ErNode
