import "./App.css"
import Diagram from "./components/Diagram"
import * as FlexLayout from "flexlayout-react"
import ControlPanel from "./components/ControlPanel"
import { MenuBar } from "./components/Menu"
import { v4 as uuidv4 } from "uuid"

const layoutModel = FlexLayout.Model.fromJson({
    global: {
        tabEnableRename: false,
    },
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
                        className: "overflow-hidden",
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
                        component: "schemcat-visualization-diagram",
                        className: "overflow-hidden",
                    }
                ]
            }
        ]
    }
})

function factory(node: FlexLayout.TabNode) {
    switch(node.getComponent()) {
    case "er-diagram":
        return <Diagram er={true} />
    case "schemcat-visualization-diagram":
        return <Diagram />
    case "control-panel":
        return <ControlPanel key={uuidv4()} />
    default:
        return <div>Unknown component: <b>{node.getComponent()}</b></div>
    }
}

function App() {
    return (
        <div className="App absolute left-0 right-0 bottom-0 top-0 flex flex-col">
            <div className="border-b-2 border-gray-200 relative block">
                <MenuBar />
            </div>
            <div className="relative left-0 right-0 bottom-0 top-0 flex-1">
                <FlexLayout.Layout model={layoutModel} factory={factory} />
            </div>
        </div>
    )
}

export default App
