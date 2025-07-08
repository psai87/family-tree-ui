import React, {memo} from 'react';
import {Handle, type NodeProps, type Node, NodeToolbar, Position, useReactFlow} from '@xyflow/react';
import type {NodeData} from "../model/Node.ts";


function PeopleNode({id, data}: NodeProps<Node<NodeData>>) {

    const {setNodes, getNode} = useReactFlow();
    const handleAddHeart: () => void = (): void => {
        const node = getNode(id);
        if (node) {
            const newNode = {
                id: crypto.randomUUID(),
                type: 'familyNode',
                position: {x: node.position.x + 200, y: node.position.y},
                data: {editable: false},
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
                position: {x: node.position.x, y: node.position.y + 200},
                data: {persons: node.data.persons, editable: data.editable},
            };
            setNodes((nds) => nds.concat(newNode));
        }
    };

    const onPersonSelect: (event: React.ChangeEvent<HTMLSelectElement>) => void = (event): void => {
        const currentNode: Node = getNode(id) as Node
        let newNode: Node = {...currentNode, data: {personId: event.target.value, persons: currentNode.data.persons},};
        setNodes((nodes) => {
            return nodes.filter(data => data.id !== id)
                .concat(newNode)
        });
    }

    return (
        <>
            <NodeToolbar position={Position.Bottom}>
                <div className="flex gap-4 bg-gray-100 p-2 rounded-md shadow">
                    <button
                        onClick={handleAddHeart}
                        className="px-2 py-1 text-xs text-white bg-red-400 hover:bg-red-500 rounded">
                        add-heart
                    </button>
                    <button
                        onClick={handleAddPeople}
                        className="px-2 py-1 text-xs text-white bg-teal-500 hover:bg-teal-600 rounded">
                        add-people
                    </button>
                </div>
            </NodeToolbar>
            <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
                <div className="flex">
                    <div className="text-xs rounded-full w-10 h-12 flex justify-center items-center bg-gray-100">
                        <img
                            src={data.persons?.get(data.personId)?.imageUrl}
                            alt="Preview"
                            className="w-16 h-14 object-cover rounded border border-gray-300 shadow-sm"
                        />
                    </div>
                    <div className="ml-2">
                        {data.editable && <select
                            id={id + "_fruit"}
                            name="fruit"
                            className="text-xs rounded-md border border-gray-300 bg-white
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500
             hover:border-gray-400 transition w-20 h-5"
                            onChange={onPersonSelect}
                        >
                            <option value="">— pick one —</option>
                            {Array.from(data.persons?.entries() ?? [])
                                .map(([key, val]) => (
                                    <option key={key} value={val.id} selected={val.id === data.personId}>
                                        {val.firstName} {val.lastName}
                                    </option>
                                ))}
                        </select>}
                        {!data.editable && <div
                            className="text-xs font-bold break-words whitespace-normal">{data.persons?.get(data.personId)?.firstName}</div>}
                        <div className="text-xs text-gray-500">{data.persons?.get(data.personId)?.lastName}</div>
                        <div
                            className="text-xs text-gray-500">{"Born:" + data.persons?.get(data.personId)?.yearOfBirth}</div>
                    </div>
                </div>

                <Handle
                    type="target"
                    position={Position.Top}
                    id="c"
                    className="w-10 !bg-teal-500"
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    id="b"
                    className="h-8 !bg-teal-500"
                />
                <Handle
                    type="source"
                    position={Position.Left}
                    id="a"
                    className="h-8 !bg-teal-500"
                />
            </div>
        </>
    )
        ;
}

export default memo(PeopleNode);