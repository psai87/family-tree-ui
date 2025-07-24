import {useCallback, useEffect, useState} from 'react';
import {
    addEdge,
    type Connection,
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
import type {Workspace} from "./model/Workspace.ts";
import type {AlertsProps} from "./model/Props.ts";

function ViewFamily({setAlerts}: AlertsProps) {
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

    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [workspace, setWorkspace] = useState<Workspace>()
    const onWorkspaceSelect: (selectedId: string) => void = (selectedId): void => {
        const selectedWorkspace: Workspace | undefined = workspaces?.find(data => data.id === selectedId)
        setWorkspace(selectedWorkspace)
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
        if (workspaces.length > 0) return;
        peopleRelationService.getWorkspaces()
            .then(response => {
                setWorkspaces(response[0])
                setWorkspace(response[0][0])
            })
            .catch(error => console.log(error))
    }, []);

    useEffect(() => {
        if (!workspace || rowPersons?.size == 0) {
            setNodes([])
            setNodesState(new Map<string, RowState>)
            return;
        }

        peopleRelationService.getNodes(workspace.id)
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
    }, [rowPersons, workspace]);

    useEffect(() => {
        if (!workspace || rowPersons?.size == 0) {
            setNodes([])
            setNodesState(new Map<string, RowState>)
            return;
        }
        peopleRelationService.getEdges(workspace.id)
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
    }, [rowPersons, workspace]);

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

    type WrapperTempNode = {
        id: string;
        node: string | null;
        heartNode: string | null;
        spouseNode: string | null;
        rootNode: boolean
    };


    type WrapperTempEdge = {
        id: string;
        handler: string
    }

    const formatClicked: () => void = () => {
        // console.log("formatting started")
        // //put node into map for easy access
        // const parentsMap = new Map<string, WrapperTempEdge[]>();
        // const childMapEdge = edges.reduce((map, edge) => {
        //     if (!map.has(edge.source)) {
        //         map.set(edge.source, []);
        //     }
        //     map.get(edge.source)!.push(edge);
        //     return map;
        // }, new Map<string, Edge<EdgeData>[]>());
        //
        //
        // for (const node of nodes) {
        //     parentsMap.set(node.id, []);
        // }
        //
        // for (const edge of edges) {
        //     const {source, target, sourceHandle} = edge;
        //     parentsMap.get(target)?.push({id: source, handler: sourceHandle as string});
        // }
        //
        //
        // const mapVisitedNodes: Map<string, boolean> = nodes.filter(node => node.type === "peopleNode").reduce((map, node) => map.set(node.id, false), new Map<string, boolean>());
        // const heartNodes: string[] = nodes.filter(node => node.type === "familyNode").map(node => node.id)
        //
        //
        // const wrapperMap: WrapperTempNode[] = [];
        //
        // for (const heartNode of heartNodes) {
        //     const parents = parentsMap.get(heartNode)
        //     let tempNode: WrapperTempNode = {
        //         id: crypto.randomUUID(),
        //         node: null,
        //         heartNode: heartNode,
        //         spouseNode: null,
        //         rootNode: (heartNode === "5eca3c72-1977-46c2-acf2-208eb4065cb3")
        //     };
        //     if (parents) {
        //         mapVisitedNodes.set(parents[0].id, true)
        //         mapVisitedNodes.set(parents[1].id, true)
        //         if (parents[0].handler === "b") {
        //             tempNode.node = parents[0].id
        //             tempNode.spouseNode = parents[1].id
        //         } else {
        //             tempNode.spouseNode = parents[0].id
        //             tempNode.node = parents[1].id
        //         }
        //         wrapperMap.push(tempNode)
        //     }
        // }
        // Array.from(mapVisitedNodes.entries()).filter(entry => !entry[1])
        //     .forEach((entry) => {
        //         wrapperMap.push({
        //             id: crypto.randomUUID(),
        //             node: entry[0],
        //             heartNode: null,
        //             spouseNode: null,
        //             rootNode: false
        //         })
        //     })
        //
        //
        // const wrapperEdgeX: Map<string, WrapperTempNode> = new Map<string, WrapperTempNode>()
        // wrapperMap.forEach((node) => {
        //     wrapperEdgeX.set(node.heartNode ?? "", node)
        //     wrapperEdgeX.set(node.node ?? "", node)
        //     wrapperEdgeX.set(node.spouseNode ?? "", node)
        // })
        //
        //
        // const spacingX = 300;
        // const spacingY = 300;
        // const newchildrenMap = new Map<string, WrapperTempNode[]>();
        // wrapperMap.filter(data => data.heartNode !== null).forEach((node) => {
        //     newchildrenMap.set(node.id, []);
        // })
        //
        // wrapperMap.filter(data => data.heartNode !== null).forEach((node) => {
        //     const childs = childMapEdge.get(node.heartNode ?? "")?.map(data => wrapperEdgeX.get(data.target) as WrapperTempNode) ?? []
        //     newchildrenMap.get(node.id)?.push(...childs)
        // })
        //
        //
        // const subtreeHeights = new Map();
        //
        // function computeSubtreeHeight(id: string) {
        //     const children = newchildrenMap.get(id);
        //     if (!children || children.length === 0) {
        //         subtreeHeights.set(id, 1);
        //         return 1;
        //     }
        //     const height: number = children.reduce((sum, childId) => sum + computeSubtreeHeight(childId.id), 0);
        //     subtreeHeights.set(id, height);
        //     return height;
        // }
        //
        // computeSubtreeHeight(wrapperMap.find(data => data.rootNode)?.id as string); // root assumed as '1'
        // console.log(subtreeHeights);
        // const positions = new Map<string, { px: number, py: number }>();
        //
        // function setPositions(id: WrapperTempNode, x: number, y: number) {
        //     const height = subtreeHeights.get(id.id);
        //     const children = newchildrenMap.get(id.id);
        //
        //     let startY = y - (height * spacingY) / 2 + spacingY / 2;
        //     positions.set(id.node as string, {px: x, py: y});
        //     positions.set(id.heartNode as string, {px: (x + 68), py: y+(100)});
        //     positions.set(id.spouseNode as string, {px: x, py: (y+(150))});
        //
        //     if (!children || children.length === 0) return;
        //
        //     for (const child of children) {
        //         const childHeight = subtreeHeights.get(child.id);
        //         const childY = startY + (childHeight * spacingY) / 2 - spacingY / 2;
        //         setPositions(child, x + spacingX, childY);
        //         startY += childHeight * spacingY;
        //     }
        // }
        // setPositions(wrapperMap.find(data => data.rootNode) as WrapperTempNode, 200, 200);
        //
        // setNodes(prevState => prevState.map(node =>  {
        //     return {
        //     ...node,
        //     position:{x:positions.get(node.id)?.px as number,y:positions.get(node.id)?.py as number},
        //     }})
        // )

// === BUILD MAPS ===
        const parentsMap = new Map<string, WrapperTempEdge[]>();
        const childMapEdge = new Map<string, Edge<EdgeData>[]>();
        const mapVisitedNodes = new Map<string, boolean>();
        const heartNodes: string[] = [];

        for (const node of nodes) {
            parentsMap.set(node.id, []);
            if (node.type === "peopleNode") {
                mapVisitedNodes.set(node.id, false);
            } else if (node.type === "familyNode") {
                heartNodes.push(node.id);
            }
        }

        for (const edge of edges) {
            const {source, target, sourceHandle} = edge;

            // childMapEdge: maps source → all children
            if (!childMapEdge.has(source)) childMapEdge.set(source, []);
            childMapEdge.get(source)!.push(edge);

            // parentsMap: maps child (target) → its parent(s)
            if (!parentsMap.has(target)) parentsMap.set(target, []);
            parentsMap.get(target)!.push({id: source, handler: sourceHandle!});
        }

// === WRAP HEART NODES ===
        const wrapperMap: WrapperTempNode[] = [];

        for (const heartNode of heartNodes) {
            const parents = parentsMap.get(heartNode);
            if (parents && parents.length === 2) {
                //const isRoot = heartNode === "5eca3c72-1977-46c2-acf2-208eb4065cb3";

                const [p1, p2] = parents;
                const node = p1.handler === "b" ? p1.id : p2.id;
                const spouse = p1.handler === "b" ? p2.id : p1.id;
                const isRoot = parentsMap.get(node)?.length == 0
                mapVisitedNodes.set(node, true);
                mapVisitedNodes.set(spouse, true);

                wrapperMap.push({id: crypto.randomUUID(), node, heartNode, spouseNode: spouse, rootNode: isRoot});
            }
        }

// === ADD UNGROUPED PEOPLE ===
        for (const [id, visited] of mapVisitedNodes.entries()) {
            if (!visited) {
                wrapperMap.push({
                    id: crypto.randomUUID(),
                    node: id,
                    heartNode: null,
                    spouseNode: null,
                    rootNode: false
                });
            }
        }

// === EDGE TO WRAPPER NODE MAPPING ===
        const wrapperEdgeX = new Map<string, WrapperTempNode>();
        for (const wrapper of wrapperMap) {
            if (wrapper.heartNode) wrapperEdgeX.set(wrapper.heartNode, wrapper);
            if (wrapper.node) wrapperEdgeX.set(wrapper.node, wrapper);
            if (wrapper.spouseNode) wrapperEdgeX.set(wrapper.spouseNode, wrapper);
        }

// === BUILD CHILDREN MAP ===
        const newChildrenMap = new Map<string, WrapperTempNode[]>();

        for (const wrapper of wrapperMap) {
            if (wrapper.heartNode) newChildrenMap.set(wrapper.id, []);
        }

        for (const wrapper of wrapperMap) {
            if (!wrapper.heartNode) continue;

            const childEdges = childMapEdge.get(wrapper.heartNode) || [];
            const children = childEdges.map(edge => wrapperEdgeX.get(edge.target)!).filter(Boolean);
            newChildrenMap.get(wrapper.id)?.push(...children);
        }

// === CALCULATE SUBTREE HEIGHTS ===
        const subtreeHeights = new Map<string, number>();

        function computeSubtreeHeight(id: string): number {
            const children = newChildrenMap.get(id);
            if (!children || children.length === 0) {
                subtreeHeights.set(id, 1);
                return 1;
            }

            let total = 0;
            for (const child of children) {
                total += computeSubtreeHeight(child.id);
            }

            subtreeHeights.set(id, total);
            return total;
        }

        const root = wrapperMap.find(w => w.rootNode);
        if (root) computeSubtreeHeight(root.id);

// === SET POSITIONS ===
        const positions = new Map<string, { px: number, py: number }>();
        const spacingX = 300;
        const spacingY = 300;

        function setPositions(wrapper: WrapperTempNode, x: number, y: number) {
            const height = subtreeHeights.get(wrapper.id) || 1;
            const children = newChildrenMap.get(wrapper.id);

            let startY = y - (height * spacingY) / 2;

            if (wrapper.node) positions.set(wrapper.node, {px: x, py: y});
            if (wrapper.heartNode) positions.set(wrapper.heartNode, {px: x + 68, py: y + 100});
            if (wrapper.spouseNode) positions.set(wrapper.spouseNode, {px: x, py: y + 150});

            if (!children || children.length === 0) return;

            for (const child of children) {
                const childHeight = subtreeHeights.get(child.id) || 1;
                const childY = startY + (childHeight * spacingY) / 2;
                setPositions(child, x + spacingX, childY);
                startY += childHeight * spacingY;
            }
        }

        if (root) setPositions(root, 200, 200);

// === APPLY POSITIONS ===
        setNodes(prev =>
            prev.map(node => ({
                ...node,
                position: {
                    x: positions.get(node.id)?.px ?? node.position.x,
                    y: positions.get(node.id)?.py ?? node.position.y,
                },
            }))
        );

        nodes.forEach(node => {
            const selectedNode = nodesState.get(node.id)
            if (!selectedNode) {
                nodesState.set(node.id, RowState.Edited)
            }
        })

    }

    const saveClicked: () => void = () => {
        setEditableButtonClicked(false)
        if (!workspace) {
            return
        } else {
            console.log("selected workspace", workspace.name)
        }
        setNodes((prevNodes) =>
            prevNodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    editable: false
                },
            }))
        );
        peopleRelationService.saveNodes(nodes, nodesState, workspace.id)
            .catch(reason => {
                console.log(reason)
                setAlerts(prevState => [...prevState, {
                    id: Date.now(),
                    type: "error",
                    message: reason.message
                }])
            })
            .finally(() => console.log("Nodes saved"));
        peopleRelationService.saveEdges(edges, edgesState, workspace.id)
            .catch(reason => {
                console.log(reason)
                setAlerts(prevState => [...prevState, {
                    id: Date.now(),
                    type: "error",
                    message: reason.message
                }])
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
                //console.log("should not happen", change.type)
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
                // console.log("should not happen", change.type)
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
                draggable={!editButtonClicked}
                elementsSelectable={editButtonClicked}
            >
                <MiniMap/>
                <Controls/>
            </ReactFlow>

            {/* Toolbar */}
            <div className="p-2 flex gap-3 bg-gray-100 border-b border-gray-300 shadow-sm justify-end">
                <select id="workspace" name="workspace"
                        value={workspace?.id}
                        className="text-sm border border-gray-300 bg-white rounded-lg px-4 py-3 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-50"
                        onChange={(event) => onWorkspaceSelect(event.target.value)}>
                    <option value="">Pick a workspace</option>
                    {workspaces?.map((data) => (
                        <option key={data.id} value={data.id}>{data.name}</option>
                    ))}
                </select>

                <button className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                        onClick={saveClicked}>
                    Save
                </button>
                <button className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                        onClick={editClicked}>
                    Edit
                </button>
                <button className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                        onClick={formatClicked}>
                    Auto Format
                </button>
            </div>
        </div>
    );
}

export default ViewFamily