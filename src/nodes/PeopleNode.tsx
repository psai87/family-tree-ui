import { memo, useState } from 'react';
import { Handle, type NodeProps, type Node, NodeToolbar, Position, useReactFlow } from '@xyflow/react';
import type { NodeData } from "../model/Node.ts";
import ImagePreview from "../ImagePreview.tsx";
import { AutocompleteSelect } from "../AutocompleteSelect.tsx";
import { Heart, Users } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardPortal, HoverCardTrigger } from "@radix-ui/react-hover-card";


function PeopleNode({ id, data }: NodeProps<Node<NodeData>>) {

    const { setNodes, getNode } = useReactFlow();
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const handleAddHeart: () => void = (): void => {
        const node = getNode(id);
        if (node) {
            const newNode = {
                id: crypto.randomUUID(),
                type: 'familyNode',
                position: { x: node.position.x + 200, y: node.position.y },
                data: { editable: false },
            };
            setNodes((nds) => nds.concat(newNode));
        }
    };

    const handleAddPeople: () => void = (): void => {
        const node = getNode(id);
        if (node) {
            const newNode = {
                id: crypto.randomUUID(),
                type: 'peopleNode',
                position: { x: node.position.x, y: node.position.y + 200 },
                data: { persons: node.data.persons, images: node.data.images, editable: data.editable },
            };
            setNodes((nds) => nds.concat(newNode));
        }
    };

    const onPersonSelect: (pId: string) => void = (pId): void => {
        const currentNode: Node = getNode(id) as Node
        let newNode: Node = {
            ...currentNode,
            data: { personId: pId, persons: currentNode.data.persons, images: currentNode.data.images, editable: data.editable },
        };
        setNodes((nodes) => {
            return nodes.filter(data => data.id !== id)
                .concat(newNode)
        });
    }

    return (
        <>
            <HoverCard>
                {!showDropdown && (
                    <NodeToolbar position={Position.Bottom}>
                        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-md shadow-lg border border-gray-300">
                            <button
                                onClick={handleAddHeart}
                                className="p-2 text-xs text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                                title="Add partner"
                            >
                                <Heart className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleAddPeople}
                                className="p-2 text-xs text-white bg-teal-500 hover:bg-teal-600 rounded-full transition-colors"
                                title="Add children"
                            >
                                <Users className="h-4 w-4" />
                            </button>
                        </div>
                    </NodeToolbar>
                )}
                <div className="px-2 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 w-40 h-20">
                    <div className="flex">
                        <HoverCardTrigger>
                            <div
                                className="pointer-events-auto text-xs rounded-full w-11 h-15 flex justify-center items-center bg-gray-100">

                                <ImagePreview buffer={data.images?.get(data.personId)}
                                    yearOfDeath={data.persons?.get(data.personId)?.yearOfDeath ?? -1} />
                            </div>
                        </HoverCardTrigger>
                        <div className="ml-2">
                            {data.editable &&
                                <AutocompleteSelect
                                    options={Array.from(data.persons?.entries() ?? []).map(([_, val]) => {
                                        return { id: val.id, value: val.firstName + " " + val.lastName };
                                    })}
                                    value={{
                                        id: data.personId,
                                        value: data.persons?.get(data.personId)?.firstName + " " + data.persons?.get(data.personId)?.lastName
                                    }}
                                    onChange={onPersonSelect}
                                    setShowDropdown={setShowDropdown}
                                />
                            }
                            {!data.editable && <div
                                className="text-xs font-bold whitespace-nowrap truncate w-24">{data.persons?.get(data.personId)?.firstName}</div>}
                            <div className="text-xs text-gray-500">{data.persons?.get(data.personId)?.lastName}</div>
                            <div
                                className="text-xs text-gray-500">{"Born:" + data.persons?.get(data.personId)?.yearOfBirth}</div>
                        </div>
                    </div>

                    <Handle
                        type="target"
                        position={Position.Left}
                        id="c"
                        className="h-8 !bg-teal-500"
                    />
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id="b"
                        className="w-10 !bg-teal-500"
                    />
                    <Handle
                        type="source"
                        position={Position.Top}
                        id="a"
                        className="w-10 !bg-teal-500"
                    />
                </div>
                <HoverCardPortal container={null}>
                    <HoverCardContent >
                        <div className="flex flex-col items-center p-4 border rounded-lg shadow-md bg-white space-y-2 w-60">
                            {/* Top - image */}
                            <div className="w-55 h-55">
                                <ImagePreview
                                    buffer={data.images?.get(data.personId)}
                                    yearOfDeath={data.persons?.get(data.personId)?.yearOfDeath ?? -1}
                                />
                            </div>

                            {/* Bottom - details */}
                            <div className="text-center space-y-1">
                                <h4 className="text-sm font-semibold">
                                    {(data.persons?.get(data.personId)?.firstName ?? "") +
                                        " " +
                                        (data.persons?.get(data.personId)?.lastName ?? "")}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    Born: {data.persons?.get(data.personId)?.yearOfBirth}
                                </p>
                                {data.persons?.get(data.personId)?.yearOfDeath != -1 && <p className="text-sm text-gray-600">
                                    Died: {data.persons?.get(data.personId)?.yearOfDeath}
                                </p>}
                            </div>
                        </div>
                    </HoverCardContent>
                </HoverCardPortal>
            </HoverCard>
        </>
    )
        ;
}

export default memo(PeopleNode);