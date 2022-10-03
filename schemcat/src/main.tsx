import {DevToolsInitialize} from "@hookstate/devtools"
import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.scss"

DevToolsInitialize({
    monitored: ["diagram"],
    callstacksDepth: 30
})

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
