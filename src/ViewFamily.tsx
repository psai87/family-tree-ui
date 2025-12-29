import { useCallback, useEffect, useState } from 'react';
import type { AuthProps } from "./model/Props.ts";
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
    useReactFlow,
    getNodesBounds,
    getViewportForBounds,
} from '@xyflow/react';
import { toPng } from 'html-to-image';
import { useNavigate } from "react-router-dom";

import '@xyflow/react/dist/base.css';

import PeopleNode from './nodes/PeopleNode';
import FamilyNode from "./nodes/FamilyNode.tsx";
import type { NodeData } from "./model/Node.ts";
import type { Person } from "./model/Person.ts";
import type { EdgeData } from "./model/Edge.ts";
import { RowState } from "./model/Constants.ts";
import type { Workspace } from "./model/Workspace.ts";
import { Download, Edit, HardDrive, Layout } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";
import ServiceFactory from "./service/ServiceFactory.ts";
import { NODE_TYPES } from "./model/NodeTypes.ts";
import { updateMapEntry } from "./utils/mapHelpers.ts";


function ViewFamily({ setAuthenticated }: AuthProps) {
    const navigate = useNavigate();
    const peopleRelationService = ServiceFactory.getPeopleRelationService();
    const [rowPersons, setRowPersons] = useState<Map<string, Person>>(new Map())
    const [imageMap, setImageMap] = useState<Map<string, ArrayBuffer>>(new Map<string, ArrayBuffer>())
    const nodeTypes = {
        [NODE_TYPES.PEOPLE]: PeopleNode,
        [NODE_TYPES.FAMILY]: FamilyNode
    };
    const [nodesState, setNodesState] = useState<Map<string, RowState>>(new Map<string, RowState>())
    const [edgesState, setEdgesState] = useState<Map<string, RowState>>(new Map<string, RowState>())
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<EdgeData>>([]);
    const [editButtonClicked, setEditableButtonClicked] = useState<boolean>(false);
    const onConnect = useCallback((params: Connection) => {
        const idUuid: string = crypto.randomUUID();
        setEdges((eds): Edge<EdgeData>[] => {
            const customEdge: Edge = { ...params, id: idUuid };
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
            .then(async response => {
                const personsMap = new Map(response[0].map(data => [data.id, data]));
                setRowPersons(personsMap);

                // Load images using helper
                const imageMap = await peopleRelationService.loadImagesForPersons(response[0]);
                setImageMap(imageMap);
            })
            .catch(error => {
                console.log(error)
                if (error.message === "Unauthorized") {
                    setAuthenticated(false);
                    navigate("/");
                }
                toast.error("Failed to load persons")
            })
    }, []);

    useEffect(() => {
        if (workspaces.length > 0) return;
        peopleRelationService.getWorkspaces()
            .then(response => {
                setWorkspaces(response[0])
                setWorkspace(response[0][0])
            })
            .catch(error => {
                console.log(error)
                if (error.message === "Unauthorized") {
                    setAuthenticated(false);
                    navigate("/");
                }
                toast.error("Failed to load workspaces")
            })
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
                        data: { personId: data.personId, persons: rowPersons, images: imageMap, editable: false },
                        position: { x: data.position.x, y: data.position.y },
                    }))
                    : [
                        {
                            id: crypto.randomUUID().toString(),
                            type: NODE_TYPES.PEOPLE,
                            data: { personId: '', persons: rowPersons, images: imageMap, editable: false },
                            position: { x: 0, y: 50 },
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
            .catch(error => {
                console.log(error)
                if (error.message === "Unauthorized") {
                    setAuthenticated(false);
                    navigate("/");
                }
                toast.error("Failed to load nodes")
            })
    }, [rowPersons, workspace, imageMap]);

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
            .catch(error => {
                console.log(error)
                if (error.message === "Unauthorized") {
                    setAuthenticated(false);
                    navigate("/");
                }
                toast.error("Failed to load edges")
            })
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

    type SpouseData = {
        heartNode: string;
        spouseNode: string;
    };

    type WrapperTempNode = {
        id: string;
        node: string | null;
        spouses: SpouseData[];
        rootNode: boolean
    };


    type WrapperTempEdge = {
        id: string;
        handler: string
    }

    const formatClicked: () => void = () => {

        // === BUILD MAPS ===
        const parentsMap = new Map<string, WrapperTempEdge[]>();
        const childMapEdge = new Map<string, Edge<EdgeData>[]>();
        const mapVisitedNodes = new Map<string, boolean>();
        const heartNodes: string[] = [];

        for (const node of nodes) {
            parentsMap.set(node.id, []);
            if (node.type === NODE_TYPES.PEOPLE) {
                mapVisitedNodes.set(node.id, false);
            } else if (node.type === NODE_TYPES.FAMILY) {
                heartNodes.push(node.id);
            }
        }

        for (const edge of edges) {
            const { source, target, sourceHandle } = edge;

            // childMapEdge: maps source → all children
            if (!childMapEdge.has(source)) childMapEdge.set(source, []);
            childMapEdge.get(source)!.push(edge);

            // parentsMap: maps child (target) → its parent(s)
            if (!parentsMap.has(target)) parentsMap.set(target, []);
            parentsMap.get(target)!.push({ id: source, handler: sourceHandle! });
        }

        // === WRAP HEART NODES ===
        const wrapperMap: WrapperTempNode[] = [];
        const nodeToWrapperMap = new Map<string, WrapperTempNode>();

        for (const heartNode of heartNodes) {
            const parents = parentsMap.get(heartNode);
            if (parents && parents.length === 2) {
                const [p1, p2] = parents;
                const node = p1.handler === "b" ? p1.id : p2.id;
                const spouse = p1.handler === "b" ? p2.id : p1.id;
                const isRoot = parentsMap.get(node)?.length == 0

                mapVisitedNodes.set(node, true);
                mapVisitedNodes.set(spouse, true);

                let wrapper = nodeToWrapperMap.get(node);
                if (!wrapper) {
                    wrapper = {
                        id: crypto.randomUUID(),
                        node: node,
                        spouses: [],
                        rootNode: isRoot
                    };
                    wrapperMap.push(wrapper);
                    nodeToWrapperMap.set(node, wrapper);
                }

                wrapper.spouses.push({ heartNode, spouseNode: spouse });
            }
        }

        // === ADD UNGROUPED PEOPLE ===
        for (const [id, visited] of mapVisitedNodes.entries()) {
            if (!visited) {
                const wrapper = {
                    id: crypto.randomUUID(),
                    node: id,
                    spouses: [],
                    rootNode: false
                };
                wrapperMap.push(wrapper);
                nodeToWrapperMap.set(id, wrapper)
            }
        }

        // === EDGE TO WRAPPER NODE MAPPING ===
        const wrapperEdgeX = new Map<string, WrapperTempNode>();
        for (const wrapper of wrapperMap) {
            if (wrapper.node) wrapperEdgeX.set(wrapper.node, wrapper);
            for (const spouseData of wrapper.spouses) {
                if (spouseData.heartNode) wrapperEdgeX.set(spouseData.heartNode, wrapper);
                if (spouseData.spouseNode) wrapperEdgeX.set(spouseData.spouseNode, wrapper);
            }
        }

        // === BUILD CHILDREN MAP ===
        const newChildrenMap = new Map<string, WrapperTempNode[]>();

        for (const wrapper of wrapperMap) {
            newChildrenMap.set(wrapper.id, []);
        }

        for (const wrapper of wrapperMap) {
            const childrenSet = new Set<WrapperTempNode>();

            for (const spouseData of wrapper.spouses) {
                if (!spouseData.heartNode) continue;
                const childEdges = childMapEdge.get(spouseData.heartNode) || [];
                const children = childEdges.map(edge => wrapperEdgeX.get(edge.target)!).filter(Boolean);
                children.forEach(c => childrenSet.add(c));
            }

            if (childrenSet.size > 0) {
                newChildrenMap.get(wrapper.id)?.push(...Array.from(childrenSet));
            }
        }

        // === CALCULATE SUBTREE HEIGHTS ===
        const subtreeHeights = new Map<string, number>();

        function computeSubtreeHeight(id: string): number {
            const wrapper = wrapperMap.find(w => w.id === id);
            const children = newChildrenMap.get(id);

            // Base height calculation: 1 unit + extra space for multiple spouses
            // Each additional spouse adds vertical space. 
            // We can approximate this by saying the node itself occupies space proportional to spouse count.
            // However, the recursive height is usually determined by the max height of children subtrees.
            // But if we stack spouses, this node ITSELF is taller efficiently.

            // Let's say each spouse adds 0.6 height unit (stacked vertically).
            const spousesCount = wrapper?.spouses.length || 0;
            const nodeSelfHeight = Math.max(1, 1 + (spousesCount - 1) * 0.6);

            if (!children || children.length === 0) {
                subtreeHeights.set(id, nodeSelfHeight);
                return nodeSelfHeight;
            }

            let totalChildrenHeight = 0;
            for (const child of children) {
                totalChildrenHeight += computeSubtreeHeight(child.id);
            }

            // The height is the max of (node's own vertical footprint) and (children's total height)
            // Actually usually it's the children's total height that dominates, unless children are few and spouses are many.
            const total = Math.max(nodeSelfHeight, totalChildrenHeight);

            subtreeHeights.set(id, total);
            return total;
        }

        const root = wrapperMap.find(w => w.rootNode);
        if (root) computeSubtreeHeight(root.id);

        // === SET POSITIONS ===
        const positions = new Map<string, { px: number, py: number }>();
        const spacingX = 250;
        const spacingY = 250;

        function setPositions(wrapper: WrapperTempNode, x: number, y: number) {
            const height = subtreeHeights.get(wrapper.id) || 1;
            const children = newChildrenMap.get(wrapper.id);

            // Provide positions for the main node and its spouses
            if (wrapper.node) positions.set(wrapper.node, { px: x, py: y });

            // Spacing between main node and first spouse/heart
            const initialHeartOffset = 90;
            const initialSpouseOffset = 135;

            // For subsequent spouses, we just add to the offset.
            // e.g. Spouse 1 at y+135. Spouse 2 at y + 135 + 150?
            const multiSpouseGap = 150;

            wrapper.spouses.forEach((spouseData, index) => {
                const currentYBase = y + (index * multiSpouseGap);

                if (spouseData.heartNode) {
                    positions.set(spouseData.heartNode, { px: x + 64, py: currentYBase + initialHeartOffset });
                }
                if (spouseData.spouseNode) {
                    positions.set(spouseData.spouseNode, { px: x, py: currentYBase + initialSpouseOffset });
                }
            });

            if (!children || children.length === 0) return;

            let startY = y - (height * spacingY) / 2;
            // Center the children block relative to the parent? 
            // Or just start from top. Usually tree algos center parent relative to children.
            // here startY is the top-left corner of the children bounding box.

            for (const child of children) {
                const childHeight = subtreeHeights.get(child.id) || 1;
                // Center this child within its allocated height slot
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
                if (reason.message === "Unauthorized") {
                    setAuthenticated(false);
                    navigate("/");
                }
                toast.error(reason.message)
            })
            .finally(() => console.log("Nodes saved"));
        peopleRelationService.saveEdges(edges, edgesState, workspace.id)
            .catch(reason => {
                console.log(reason)
                if (reason.message === "Unauthorized") {
                    setAuthenticated(false);
                    navigate("/");
                }
                toast.error(reason.message)
            })
            .finally(() => console.log("Edges saved"));
    }

    const { getNodes } = useReactFlow();
    const onDownload = () => {
        const nodes = getNodes();
        if (nodes.length === 0) return;

        const nodesBounds = getNodesBounds(nodes);

        // Add padding to the bounds
        const padding = 5;
        const imageWidth = nodesBounds.width + padding * 2;
        const imageHeight = nodesBounds.height + padding * 2;

        const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 1, 2, 0.5);

        toPng(document.querySelector('.react-flow__viewport') as HTMLElement, {
            backgroundColor: 'oklch(0.99 0.005 45)',
            width: imageWidth,
            height: imageHeight,
            style: {
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            },
            pixelRatio: 3,
        }).then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `family-tree-${workspace?.name || 'export'}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Download started")
        }).catch(err => {
            console.error(err);
            toast.error("Failed to download image");
        });
    };

    const handleNodesChange = useCallback((changes: NodeChange<Node<NodeData>>[]) => {
        changes.forEach(change => {
            if (change.type === 'remove') {
                console.log("node-remove", change.id)
                setNodesState(oldMap => updateMapEntry(oldMap, change.id, RowState.Deleted))
            } else if (change.type === 'add') {
                setNodesState(oldMap => updateMapEntry(oldMap, change.item.id, RowState.Added))
            } else if (change.type === 'position' || change.type === 'replace') {
                setNodesState(oldMap => {
                    const state: RowState = (oldMap.get(change.id) && oldMap.get(change.id) == RowState.Added) ? RowState.Added : RowState.Edited
                    return updateMapEntry(oldMap, change.id, state);
                })
            } else {
                console.log("should not happen", change.type)
            }
        });
        onNodesChange(changes);
    }, [nodesState, onNodesChange]);

    const handleEdgesChange = useCallback((changes: EdgeChange<Edge<EdgeData>>[]) => {
        changes.forEach(change => {
            if (change.type === 'remove') {
                console.log("edge-remove", change.id)
                setEdgesState(oldMap => updateMapEntry(oldMap, change.id, RowState.Deleted))
            } else {
                console.log("should not happen", change.type)
            }
        });
        onEdgesChange(changes);
    }, [edgesState, onEdgesChange]);


    return (
        <div className="h-full bg-muted md:p-4 overflow-hidden">
            <div className="max-w-full mx-auto bg-card shadow-2xl rounded-2xl border border-border flex flex-col h-full overflow-hidden">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={handleEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    defaultEdgeOptions={defaultEdgeOptions}
                    className="bg-[oklch(0.99_0.005_45)] flex-1"
                    minZoom={1}
                    maxZoom={2}
                    nodesDraggable={editButtonClicked}
                    nodesConnectable={editButtonClicked}
                    draggable={!editButtonClicked}
                    elementsSelectable={editButtonClicked}
                >
                    <MiniMap />
                    <Controls />
                </ReactFlow>

                {/* Toolbar */}
                <div className="p-3 flex flex-wrap gap-3 bg-muted/40 border-t border-border shadow-sm justify-end items-center">
                    <select
                        id="workspace"
                        name="workspace"
                        value={workspace?.id}
                        className="text-sm border border-border bg-card rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                        onChange={(event) => onWorkspaceSelect(event.target.value)}
                    >
                        <option value="">Pick a workspace</option>
                        {workspaces?.map((data) => (
                            <option key={data.id} value={data.id}>{data.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={saveClicked}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg",
                            "bg-green-600 text-white hover:bg-green-700 transition-all shadow-md active:scale-95",
                        )}
                    >
                        <HardDrive className="h-4 w-4" />
                        Save
                    </button>
                    <button
                        onClick={editClicked}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg",
                            "bg-primary text-white hover:opacity-90 transition-all shadow-md active:scale-95",
                        )}
                    >
                        <Edit className="h-4 w-4" />
                        Edit
                    </button>
                    <button
                        onClick={formatClicked}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg",
                            "bg-secondary text-white hover:opacity-90 transition-all shadow-md active:scale-95",
                        )}
                    >
                        <Layout className="h-4 w-4" />
                        Auto Format
                    </button>
                    <button
                        onClick={onDownload}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg",
                            "bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-md active:scale-95",
                        )}
                    >
                        <Download className="h-4 w-4" />
                        Download Image
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ViewFamily;