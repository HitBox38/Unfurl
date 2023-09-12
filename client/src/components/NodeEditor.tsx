import { UseNodeStore } from "../Store/Node";

const NodeEditor = () => {
  const { node } = UseNodeStore((state) => state);
  return (
    <div style={{ border: "1px solid #f6f6f6", borderRadius: 10 }}>
      <h3>{node?.name}</h3>
      <textarea value={node?.content.join(" ")} style={{ height: "100px", width: "500px" }} />
      {node?.choices.map((choice) => (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <input value={choice.text} /> ➡ <h4>{choice.destination}</h4>
        </div>
      ))}
    </div>
  );
};

export default NodeEditor;
