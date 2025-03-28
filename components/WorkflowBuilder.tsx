import React, { useState, useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";
import StartNode from "./StartNode";
import EndNode from "./EndNode";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "start",
    position: { x: 250, y: 50 },
    data: { label: "Start" },
  },
  {
    id: "2",
    type: "end",
    position: { x: 250, y: 300 },
    data: { label: "End" },
  },
];

const WorkflowBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([
    { id: "e1-2", source: "1", target: "2" },
  ]);
  const [nodeId, setNodeId] = useState<number>(3);

  const addNodeBetween = useCallback(
    (prevNodeId: string, nextNodeId: string) => {
      const newNode: Node = {
        id: `${nodeId}`,
        type: "custom",
        position: { x: 250, y: 50 + nodeId * 100 },
        data: { label: `Node ${nodeId - 2}` },
      };

      setNodes((nds) => {
        return [...nds, newNode];
      });

      setEdges((eds) => {
        return [
          ...eds,
          {
            id: `e${prevNodeId}-${nodeId}`,
            source: prevNodeId,
            target: `${nodeId}`,
          },
          {
            id: `e${nodeId}-${nextNodeId}`,
            source: `${nodeId}`,
            target: nextNodeId,
          },
        ];
      });

      setNodeId((id) => id + 1);
    },
    [nodeId, setNodes, setEdges]
  );

  return (
    <div style={{ width: "100vw", height: "90vh" }}>
      <ReactFlow
        nodes={nodes.map((node) => {
          return {
            ...node,
            data: {
              ...node.data,
              addButton:
                node.id !== "2" ? (
                  <button
                    style={{
                      position: "absolute",
                      right: -30,
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      addNodeBetween(
                        node.id,
                        edges.find((e) => e.source === node.id)?.target || "2"
                      );
                    }}
                  >
                    ➕
                  </button>
                ) : null,
            },
          };
        })}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={{ start: StartNode, end: EndNode, custom: CustomNode }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default WorkflowBuilder;
