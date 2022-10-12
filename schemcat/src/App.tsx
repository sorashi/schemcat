import React, { useState } from "react"
import reactLogo from "./assets/react.svg"
import "./App.css"
import Diagram from "./components/Diagram"
import MovableSvgComponent from "./components/MovableSvgComponent"
import *  as FlexLayout from "flexlayout-react"
import ControlPanel from "./components/ControlPanel"
import { DiagramModel, ErNode as ErNodeModel, ErNodeType, Connection } from "./model/DiagramNode"
import { useStore } from "./hooks/useStore"

const layoutModel = FlexLayout.Model.fromJson({
    global: {},
    borders: [],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 10,
                children: [
                    {
                        type: "tab",
                        name: "Control Panel",
                        component: "control-panel",
                    }
                ]
            },
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "ER Diagram",
                        component: "er-diagram",
                    }
                ]
            },
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "Schemcat Visualization",
                        component: "er-diagram",
                    }
                ]
            }
        ]
    }
})

function factory(node: FlexLayout.TabNode) {
    switch(node.getComponent()) {
    case "er-diagram":
        return <Diagram />
    case "control-panel":
        return <ControlPanel />
    default:
        return <div>Unknown component: <b>{node.getComponent()}</b></div>
    }
}

function App() {
    const diagram = useStore(state => state.diagram)
    return (
        <div className="App absolute left-0 right-0 bottom-0 top-0 flex flex-col">
            <div>
                <p>Menu</p>
            </div>
            <div className="relative left-0 right-0 bottom-0 top-0 flex-1">
                <FlexLayout.Layout model={layoutModel} factory={factory} />
            </div>
        </div>
    )
}

export default App
