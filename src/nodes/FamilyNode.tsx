import {Component, memo} from 'react';
import {Handle, Position} from '@xyflow/react';
import type {NodeData} from "../model/Node.ts";

class FamilyNode extends Component<{ data: NodeData }> {
    render() {
        return (
            <div className="w-8 h-8 flex items-center justify-center text-2xl bg-transparent">
                ❤️
                <Handle
                    type="source"
                    position={Position.Right}
                    id="c"
                    className="w-1 h-1 rounded-full !bg-teal-500"
                />
                <Handle
                    type="target"
                    position={Position.Bottom}
                    id="b"
                    className="w-1 h-1 rounded-full !bg-teal-500"
                />
                <Handle
                    type="target"
                    position={Position.Top}
                    id="a"
                    className="w-1 h-1 rounded-full !bg-teal-500"
                />
            </div>
        );
    }
}

export default memo(FamilyNode);