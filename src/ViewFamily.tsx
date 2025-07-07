import {useCallback, useEffect, useState} from 'react';
import {
    type Node,
    ReactFlow,
    useNodesState,
    useEdgesState,
    addEdge,
    MiniMap,
    Controls, MarkerType, type Edge,
} from '@xyflow/react';

import '@xyflow/react/dist/base.css';

import PeopleNode from './nodes/PeopleNode';
import FamilyNode from "./nodes/FamilyNode.tsx";
import type {NodeData} from "./model/Node.ts";
import PeopleRelationService from "./service/PeopleRelationService.ts";
import type {Person} from "./model/Person.ts";
import type {EdgeData} from "./model/Edge.ts";

function ViewFamily() {
    const peopleRelationService: PeopleRelationService = new PeopleRelationService();
    const [rowPersons, setRowPersons] = useState<Map<string, Person>>(new Map())
    const nodeTypes = {
        peopleNode: PeopleNode,
        familyNode: FamilyNode
    };
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>([]);
    const onConnect = useCallback(
        (params: any) => setEdges((eds): any => addEdge(params, eds)),
        [],
    );
    const defaultEdgeOptions = {
        type: 'smoothstep',
        markerEnd: {
            type: MarkerType.Arrow,
        },
    }

    useEffect(() => {
        peopleRelationService.getPersons()
            .then(response => {
                setRowPersons(new Map(response[0].map(data => [data.id, data])))
            })
            .catch(error => console.log(error))
    }, []);

    useEffect(() => {
        peopleRelationService.getNodes()
            .then(response => {
                const initNodes: Node<NodeData>[] = response.length > 0
                    ? response.map(data => ({
                        id: data.id,
                        type: data.type,
                        data: {personId: data.personId, persons: rowPersons},
                        position: {x: data.position.x, y: data.position.y},
                    }))
                    : [
                        {
                            id: crypto.randomUUID().toString(),
                            type: 'peopleNode',
                            data: {personId: '', persons: rowPersons},
                            position: {x: 0, y: 50},
                        },
                    ];
                console.log(initNodes)
                setNodes(initNodes)
            })
            .catch(error => console.log(error))
    }, [rowPersons]);


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