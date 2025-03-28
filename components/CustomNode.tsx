import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

interface CustomNodeData {
  label: string;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Top} />
      <div className="node-content">
        <span>{data.label}</span>
        <button className="delete-btn">🗑</button>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default CustomNode;
