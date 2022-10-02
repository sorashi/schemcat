import React, { useState } from "react"
import reactLogo from "./assets/react.svg"
import "./App.css"
import Diagram from "./components/Diagram"
import MovableSvgComponent from "./components/MovableSvgComponent"
import *  as FlexLayout from "flexlayout-react"

function App() {
    const state = FlexLayout.Model.fromJson({
        global: {},
        borders: [],
        layout: {
            type: "row",
            weight: 100,
            children: [
                {
                    type: "tabset",
                    weight: 50,
                    children: [
                        {
                            type: "tab",
                            name: "One",
                            component: "button",
                        }
                    ]
                },
                {
                    type: "tabset",
                    weight: 50,
                    children: [
                        {
                            type: "tab",
                            name: "Two",
                            component: "button",
                        }
                    ]
                }
            ]
        }
    })
    function factory(node: FlexLayout.TabNode) {
        return <Diagram />
    }
    return (
        <div className="App absolute left-0 right-0 bottom-0 top-0 flex flex-col">
            <div>
                <p>Menu</p>
            </div>
            <div className="relative left-0 right-0 bottom-0 top-0 flex-1">
                <FlexLayout.Layout model={state} factory={factory} />
            </div>
        </div>
    )
}

export default App
