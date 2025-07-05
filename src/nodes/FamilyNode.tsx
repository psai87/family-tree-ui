import {Component, memo} from 'react';
import {Handle, Position} from '@xyflow/react';

class FamilyNode extends Component<{ data: any }> {
    render() {
        return (
            <div className="w-8 h-8 flex items-center justify-center text-2xl bg-transparent">
                ❤️
                <Handle
                    type="source"
                    position={Position.Bottom}
                    id="c"
                    className="w-0.5 h-0.5 rounded-full !bg-teal-500"
                />
                <Handle
                    type="target"
                    position={Position.Right}
                    id="b"
                    className="w-0.5 h-0.5 rounded-full !bg-teal-500"
                />
                <Handle
                    type="target"
                    position={Position.Left}
                    id="a"
                    className="w-0.5 h-0.5 rounded-full !bg-teal-500"
                />
            </div>
        );
    }
}

export default memo(FamilyNode);