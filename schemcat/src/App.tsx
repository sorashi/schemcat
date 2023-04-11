import produce, { enableMapSet } from 'immer'
enableMapSet()

import './App.css'
import Diagram from './components/Diagram'
import * as FlexLayout from 'flexlayout-react'
import ControlPanel from './components/ControlPanel'
import { MenuBar } from './components/Menu'
import { v4 as uuidv4 } from 'uuid'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import DragAndDropPanel from './components/DragAndDropPanel'
import { useLayoutEffect, useState } from 'react'
import SchemcatDiagram from './components/SchemcatDiagram'
import { ExportSvgDialog } from './components/Dialog/ExportSvgDialog'
import { useStore } from './hooks/useStore'
import { DiagramType } from './model/Constats'
import { SchemcatVisualizationDiagram } from './components/SchemcatVisualizationDiagram'

const defaultLayoutModel = FlexLayout.Model.fromJson({
  global: {
    tabEnableRename: false,
    tabEnableClose: false,
    tabSetEnableClose: false,
  },
  borders: [],
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'row',
        weight: 10,
        children: [
          {
            type: 'tabset',
            weight: 10,
            children: [
              {
                type: 'tab',
                name: 'Control Panel',
                component: 'control-panel',
              },
            ],
          },
          {
            type: 'tabset',
            weight: 10,
            children: [
              {
                type: 'tab',
                name: 'Drag and Drop',
                component: 'drag-and-drop-panel',
              },
            ],
          },
        ],
      },
      {
        type: 'tabset',
        weight: 50,
        children: [
          {
            type: 'tab',
            name: 'ER Diagram',
            component: 'er-diagram',
            className: 'overflow-hidden',
          },
        ],
      },
      {
        type: 'tabset',
        weight: 50,
        children: [
          {
            type: 'tab',
            name: 'Schemcat Diagram',
            component: 'schemcat-diagram',
            className: 'overflow-hidden',
          },
          {
            type: 'tab',
            name: 'Schemcat Visualization',
            component: 'schemcat-visualization-diagram',
            className: 'overflow-hidden',
          },
        ],
      },
    ],
  },
})

function setActiveDiagram(diagram: DiagramType) {
  useStore.setState(
    produce((state) => {
      state.activeDiagram = diagram
    })
  )
}

function factory(node: FlexLayout.TabNode) {
  const isSelectedNodeInActiveTabset = node.getModel().getActiveTabset()?.getSelectedNode() === node
  switch (node.getComponent()) {
    case 'er-diagram':
      isSelectedNodeInActiveTabset && setActiveDiagram(DiagramType.Er)
      return <Diagram isSelectedNodeInActiveTabSet={isSelectedNodeInActiveTabset} />
    case 'schemcat-visualization-diagram':
      isSelectedNodeInActiveTabset && setActiveDiagram(DiagramType.SchemcatVis)
      return <SchemcatVisualizationDiagram isSelectedNodeInActiveTabSet={isSelectedNodeInActiveTabset} />
    case 'schemcat-diagram':
      isSelectedNodeInActiveTabset && setActiveDiagram(DiagramType.Schemcat)
      return <SchemcatDiagram isSelectedNodeInActiveTabSet={isSelectedNodeInActiveTabset} />
    case 'control-panel':
      return <ControlPanel key={uuidv4()} />
    case 'drag-and-drop-panel':
      return <DragAndDropPanel />
    default:
      return (
        <div>
          Unknown component: <b>{node.getComponent()}</b>
        </div>
      )
  }
}

const LAYOUT_STORAGE = 'schemcat-layout'
function getSavedLayout(): FlexLayout.Model | null {
  const saved = localStorage.getItem(LAYOUT_STORAGE)
  if (saved) return FlexLayout.Model.fromJson(JSON.parse(saved))
  return null
}
function setSavedLayout(layout: FlexLayout.Model) {
  localStorage.setItem(LAYOUT_STORAGE, JSON.stringify(layout.toJson()))
}

function App() {
  const [layoutModelState, setLayoutModelState] = useState(defaultLayoutModel)

  useLayoutEffect(() => {
    const savedLayout = getSavedLayout()
    if (savedLayout) setLayoutModelState(savedLayout)
  }, [])

  return (
    <div className='App absolute left-0 right-0 bottom-0 top-0 flex flex-col'>
      <div className='border-b-2 border-gray-200 relative block'>
        <MenuBar />
      </div>
      <div className='relative left-0 right-0 bottom-0 top-0 flex-1'>
        <DndProvider backend={HTML5Backend}>
          <FlexLayout.Layout
            model={layoutModelState}
            onModelChange={(model) => {
              setSavedLayout(model)
            }}
            factory={factory}
          />
        </DndProvider>
      </div>
    </div>
  )
}

export default App
