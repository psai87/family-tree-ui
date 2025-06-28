import {Component, memo} from 'react';
import {Handle, Position} from '@xyflow/react';

class PeopleNode extends Component<{ data: any }> {
    render() {
        let {data} = this.props;
        return (
            <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
                <div className="flex">
                    <div className="rounded-full w-10 h-12 flex justify-center items-center bg-gray-100">
                        {data.emoji}
                    </div>
                    <div className="ml-2">
                        <div className="text-xs font-bold break-words whitespace-normal">{data.name}</div>
                        <div className="text-xs text-gray-500">{data.job}</div>
                        <div className="text-xs text-gray-500">{'email'}</div>
                    </div>
                </div>

                <Handle
                    type="target"
                    position={Position.Top}
                    className="w-10 !bg-teal-500"
                />
                {/*<Handle*/}
                {/*    type="source"*/}
                {/*    position={Position.Bottom}*/}
                {/*    className="w-12 !bg-teal-500"*/}
                {/*/>*/}
                <Handle
                    type="source"
                    position={Position.Right}
                    className="h-8 !bg-teal-500"
                />
                <Handle
                    type="source"
                    position={Position.Left}
                    className="h-8 !bg-teal-500"
                />
            </div>
        );
    }
}

export default memo(PeopleNode);