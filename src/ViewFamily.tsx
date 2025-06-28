import {useCallback} from 'react';
import {
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    MiniMap,
    Controls,
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
            id: '1',
            type: 'peopleNode',
            data: {name: 'sai shravan peravali', job: 'CEO', emoji: '😎'},
            position: {x: 0, y: 50},
        },
        {
            id: '2',
            type: 'peopleNode',
            data: {name: 'Tyler Weary', job: 'Designer', emoji: '🤓'},

            position: {x: -200, y: 200},
        },
        {
            id: '3',
            type: 'familyNode',
            data: {name: 'Kristi Price', job: 'Developer', emoji: '🤩'},
            position: {x: 200, y: 200},
        },
    ];

    const initEdges = [
        {
            id: 'e1-2',
            source: '1',
            target: '2',
        },
        {
            id: 'e1-3',
            source: '1',
            target: '3',
        },
    ];

    const [nodes, _, onNodesChange] = useNodesState(initNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [],
    );

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-teal-50"
        >
            <MiniMap/>
            <Controls/>
        </ReactFlow>
    );
}

export default ViewFamily