import ErNode from "./ErNode"
import { ErNode as ErNodeModel, ErNodeType} from "../model/DiagramModel"

function DragAndDropPanel() {
    const entityType = new ErNodeModel("EntityType", ErNodeType.EntityType, 0, 0)
    const attributeType = new ErNodeModel("AttributeType", ErNodeType.AttributeType, 0, 0)
    const relationshipType = new ErNodeModel("RelationshipType", ErNodeType.RelationshipType, 0, 0)
    return <div className="flex flex-row flex-wrap gap-2 p-5">
        <div className="w-auto h-auto">
            <svg className="border border-gray-400 rounded-lg w-40 h-20" viewBox="0 0 100 100">
                <ErNode node={entityType} selected={false}></ErNode>
            </svg>
            <p className="text-center text-sm text-gray-400 font-sans">Entity Type</p>
        </div>
        <div className="w-auto h-auto">
            <svg className="border border-gray-400 rounded-lg w-40 h-20" viewBox="0 0 100 100">
                <ErNode node={attributeType} selected={false}></ErNode>
            </svg>
            <p className="text-center text-sm text-gray-400 font-sans">Attribute Type</p>
        </div>
        <div className="w-auto h-auto">
            <svg className="border border-gray-400 rounded-lg w-40 h-20" viewBox="0 0 100 100">
                <ErNode node={relationshipType} selected={false}></ErNode>
            </svg>
            <p className="text-center text-sm text-gray-400 font-sans">Relationship Type</p>
        </div>
    </div>
}

export default DragAndDropPanel