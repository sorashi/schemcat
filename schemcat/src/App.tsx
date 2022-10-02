import React, { useState } from "react"
import reactLogo from "./assets/react.svg"
import "./App.css"
import Diagram from "./components/Diagram"
import MovableSvgComponent from "./components/MovableSvgComponent"

function App() {
    return (
        <div className="App h-screen">
            <div className="bg-teal-300 h-full">
                <Diagram />
            </div>
        </div>
    )
}

export default App
