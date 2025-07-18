import React, {memo} from 'react';
import {Handle, type NodeProps, type Node, NodeToolbar, Position, useReactFlow} from '@xyflow/react';
import type {NodeData} from "../model/Node.ts";
import Util from "../model/Util.ts";


function PeopleNode({id, data}: NodeProps<Node<NodeData>>) {

    const {setNodes, getNode} = useReactFlow();
    const util: Util = new Util();
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
        let newNode: Node = {
            ...currentNode,
            data: {personId: event.target.value, persons: currentNode.data.persons, editable: data.editable},
        };
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
            <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 w-42 h-20">
                <div className="flex">
                    <div className="text-xs rounded-full w-14 h-15 flex justify-center items-center bg-gray-100">
                        <img
                            src={URL.createObjectURL(new Blob([util.base64ToArrayBuffer(data.persons?.get(data.personId)?.image ?? '')], {type: "image/jpeg"}))}
                            alt="Preview"
                            className={data.persons?.get(data.personId)?.yearOfDeath == -1 ? "w-full h-full object-cover rounded border border-gray-400 shadow-sm" : "w-full h-full object-cover rounded border-3 border-rose-900 shadow-sm"}
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
                            value={data.personId}
                        >
                            <option value="">— pick one —</option>
                            {Array.from(data.persons?.entries() ?? [])
                                .map(([key, val]) => (
                                    <option key={key} value={val.id}>
                                        {val.firstName} {val.lastName}
                                    </option>
                                ))}
                        </select>}
                        {!data.editable && <div
                            className="text-xs font-bold whitespace-nowrap truncate w-20">{data.persons?.get(data.personId)?.firstName}</div>}
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