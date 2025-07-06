import {memo} from 'react';
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
                data: {},
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
                data: {},
            };
            setNodes((nds) => nds.concat(newNode));
        }
    };

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
                    <div className="rounded-full w-10 h-12 flex justify-center items-center bg-gray-100">
                        {data?.persons?.get(data.personId)?.imageUrl}
                    </div>
                    <div className="ml-2">
                        <select
                            id={id + "_fruit"}
                            name="fruit"
                            className="text-sm px-2 py-1 pr-6 rounded-md border border-gray-300 bg-white
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
             hover:border-gray-400 transition w-20"
                        >
                            <option value="">— pick one —</option>
                            <option>Apple</option>
                        </select>
                        <div
                            className="text-xs font-bold break-words whitespace-normal">{data?.persons?.get(data.personId)?.firstName}</div>
                        <div className="text-xs text-gray-500">{data?.persons?.get(data.personId)?.lastName}</div>
                        <div className="text-xs text-gray-500">{data?.persons?.get(data.personId)?.email}</div>
                        <div className="text-xs text-gray-500">{data?.persons?.get(data.personId)?.occupation}</div>
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