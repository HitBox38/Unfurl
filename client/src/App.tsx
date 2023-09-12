import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import FileUpload from "./components/FileUpload";
import { UseJsonDataStore } from "./Store/JsonData";
import DownloadButton from "./components/DownloadButton";
import DialogViewer from "./components/DialogViewer";
import { UseNodeStore } from "./Store/Node";
import NodeEditor from "./components/NodeEditor";

function App() {
  const [count, setCount] = useState(0);
  const { name } = UseJsonDataStore((state) => state);
  const { node } = UseNodeStore((state) => state);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Twee ➡ JSON</h1>
      {name === "" ? (
        <FileUpload />
      ) : (
        <button onClick={() => window.location.reload()}>Upload another file</button>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          width: "1250px",
          padding: "15px 0",
        }}>
        {name !== "" && <DialogViewer />}
        {node !== null && <NodeEditor />}
      </div>
      {name !== "" && <DownloadButton />}
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  );
}

export default App;
