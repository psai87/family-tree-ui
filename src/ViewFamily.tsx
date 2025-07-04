import {useCallback} from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    MiniMap,
    Controls, MarkerType,
} from '@xyflow/react';

import '@xyflow/react/dist/base.css';

import PeopleNode from './nodes/PeopleNode';
import FamilyNode from "./nodes/FamilyNode.tsx";

function ViewFamily() {

    const nodeTypes = {
        peopleNode: PeopleNode,
        familyNode: FamilyNode
    };

    const initNodes = [
        {
            id: '0',
            type: 'peopleNode',
            data: {name: 'temp name', job: 'n/a', emoji: '😎'},
            position: {x: 0, y: 50},
        }
    ];

    const [nodes, _, onNodesChange] = useNodesState(initNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const onConnect = useCallback(
        (params: any) => setEdges((eds): any => addEdge(params, eds)),
        [],
    );

    const defaultEdgeOptions = {
        type: 'smoothstep',
        markerEnd: {
            type: MarkerType.Arrow, // Adds a standard arrow at the end
        },
    }

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            defaultEdgeOptions={defaultEdgeOptions}
            className="bg-teal-50"
        >
            <MiniMap/>
            <Controls/>
        </ReactFlow>
    );
}

export default ViewFamily