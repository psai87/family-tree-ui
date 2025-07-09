import {useCallback, useEffect, useState} from 'react';
import {
    addEdge, type Connection,
    Controls,
    type Edge,
    type EdgeChange,
    MarkerType,
    MiniMap,
    type Node,
    type NodeChange,
    ReactFlow,
    useEdgesState,
    useNodesState,
} from '@xyflow/react';

import '@xyflow/react/dist/base.css';

import PeopleNode from './nodes/PeopleNode';
import FamilyNode from "./nodes/FamilyNode.tsx";
import type {NodeData} from "./model/Node.ts";
import PeopleRelationService from "./service/PeopleRelationService.ts";
import type {Person} from "./model/Person.ts";
import type {EdgeData} from "./model/Edge.ts";
import {RowState} from "./model/Constants.ts";

function ViewFamily() {
    const peopleRelationService: PeopleRelationService = new PeopleRelationService();
    const [rowPersons, setRowPersons] = useState<Map<string, Person>>(new Map())
    const nodeTypes = {
        peopleNode: PeopleNode,
        familyNode: FamilyNode
    };
    const [nodesState, setNodesState] = useState<Map<string, RowState>>(new Map<string, RowState>())
    const [edgesState, setEdgesState] = useState<Map<string, RowState>>(new Map<string, RowState>())
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>([]);
    const [editButtonClicked, setEditableButtonClicked] = useState<boolean>(false);
    const onConnect = useCallback((params: Connection) => {
            const idUuid: string = crypto.randomUUID();
            setEdges((eds): Edge<EdgeData>[] => {
                const customEdge: Edge = {...params, id: idUuid};
                return addEdge(customEdge, eds);
            })
            const newEdgesStateMap = new Map(edgesState);
            newEdgesStateMap.set(idUuid, RowState.Added)
            setEdgesState(newEdgesStateMap)
        },
        [edgesState],
    );

    const defaultEdgeOptions = {
        type: 'smoothstep',
        markerEnd: {
            type: MarkerType.Arrow,
        },
    }

    useEffect(() => {
        if (rowPersons.size > 0) return;
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
                        data: {personId: data.personId, persons: rowPersons, editable: false},
                        position: {x: data.position.x, y: data.position.y},
                    }))
                    : [
                        {
                            id: crypto.randomUUID().toString(),
                            type: 'peopleNode',
                            data: {personId: '', persons: rowPersons, editable: false},
                            position: {x: 0, y: 50},
                        },
                    ];
                setNodes(initNodes)
                const newNodesStateMap: Map<string, RowState> = initNodes.reduce(
                    (map, node) => {
                        const state = response.length > 0 ? RowState.Original : RowState.Added;
                        map.set(node.id, state);
                        return map;
                    },
                    new Map<string, RowState>()
                );
                setNodesState(newNodesStateMap)
            })
            .catch(error => console.log(error))
    }, [rowPersons]);

    useEffect(() => {
        peopleRelationService.getEdges()
            .then(response => {
                const initEdges: Edge<EdgeData>[] = response.map(data => ({
                    id: data.id,
                    source: data.source,
                    sourceHandle: data.sourceHandler,
                    target: data.target,
                    targetHandle: data.targetHandler
                }));
                setEdges(initEdges)
                const newEdgesStateMap: Map<string, RowState> = initEdges.reduce(
                    (map, edge) => map.set(edge.id, RowState.Original),
                    new Map<string, RowState>()
                );
                setEdgesState(newEdgesStateMap)
            })
            .catch(error => console.log(error))
    }, [rowPersons]);

    const editClicked: () => void = () => {
        setEditableButtonClicked(true)
        setNodes((prevNodes) =>
            prevNodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    editable: true
                },
            }))
        );
    }

    const saveClicked: () => void = () => {
        setEditableButtonClicked(false)
        setNodes((prevNodes) =>
            prevNodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    editable: false
                },
            }))
        );
        peopleRelationService.saveNodes(nodes, nodesState)
            .catch(reason => {
                console.log(reason)
            })
            .finally(() => console.log("Nodes saved"));
        peopleRelationService.saveEdges(edges, edgesState)
            .catch(reason => {
                console.log(reason)
            })
            .finally(() => console.log("Edges saved"));
    }

    const handleNodesChange = useCallback((changes: NodeChange<Node<NodeData>>[]) => {
        changes.forEach(change => {
            if (change.type === 'remove') {
                const newNodesStateMap = new Map(nodesState);
                newNodesStateMap.set(change.id, RowState.Deleted)
                setNodesState(newNodesStateMap)
            } else if (change.type === 'add') {
                const newNodesStateMap = new Map(nodesState);
                newNodesStateMap.set(change.item.id, RowState.Added)
                setNodesState(newNodesStateMap)
            } else if (change.type === 'position' || change.type === 'replace') {
                const newNodesStateMap = new Map(nodesState);
                const state: RowState = (nodesState.get(change.id) && nodesState.get(change.id) == RowState.Added) ? RowState.Added : RowState.Edited
                newNodesStateMap.set(change.id, state)
                setNodesState(newNodesStateMap)
            } else {
                console.log("should not happen", change.type)
            }
        });
        onNodesChange(changes);
    }, [nodesState, onNodesChange]);

    const handleEdgesChange = useCallback((changes: EdgeChange<Edge<EdgeData>>[]) => {
        changes.forEach(change => {
            if (change.type === 'remove') {
                const newEdgesStateMap = new Map(edgesState);
                newEdgesStateMap.set(change.id, RowState.Deleted)
                setEdgesState(newEdgesStateMap)
            } else {
                console.log("should not happen", change.type)
            }
        });
        onEdgesChange(changes);
    }, [nodesState, onEdgesChange]);


    return (
        <div className="h-screen w-full flex flex-col">

            <ReactFlow

                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                defaultEdgeOptions={defaultEdgeOptions}
                className="bg-teal-50"
                minZoom={1}
                maxZoom={1.5}
                nodesDraggable={editButtonClicked}
                nodesConnectable={editButtonClicked}
                draggable={true}
                elementsSelectable={editButtonClicked}
            >
                <MiniMap/>
                <Controls/>
            </ReactFlow>

            {/* Toolbar */}
            <div className="p-2 flex gap-3 bg-gray-100 border-b border-gray-300 shadow-sm justify-end">
                <button className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                        onClick={saveClicked}>
                    Save
                </button>
                <button className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                        onClick={editClicked}>
                    Edit
                </button>
            </div>
        </div>
    );
}

export default ViewFamily