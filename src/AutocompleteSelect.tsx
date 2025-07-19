import React, {Component, createRef} from "react";
import { createPortal } from "react-dom";

// Option type
type Option = {
    id: string;
    value: string;
};

// Props type
type AutocompleteSelectProps = {
    options: Option[];
    value: Option;
    onChange: (option: string) => void;
    placeholder?: string;
};

type Pos = {
    top: number;
    left: number;
    width: number
}

// State type
type AutocompleteSelectState = {
    inputValue: string;
    showDropdown: boolean;
    dropdownPosition: Pos | null;
};

export class AutocompleteSelect extends Component<AutocompleteSelectProps, AutocompleteSelectState> {
    containerRef: React.RefObject<HTMLDivElement | null>;
    inputRef: React.RefObject<HTMLInputElement | null>;

    constructor(props: AutocompleteSelectProps) {
        super(props);
        this.state = {inputValue: "", showDropdown: false, dropdownPosition: null};
        this.containerRef = createRef();
        this.inputRef = createRef();
    }

    componentDidMount() {
        console.log("mounted",);
        document.addEventListener("mousedown", this.handleClickOutside, true);
        this.updateInputValueFromProps();
        window.addEventListener("resize", this.updateDropdownPosition);
    }

    componentDidUpdate(prevProps: AutocompleteSelectProps) {
        if (prevProps.value.id !== this.props.value.id) {
            this.updateInputValueFromProps();
        }
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleClickOutside, true);
        window.removeEventListener("resize", this.updateDropdownPosition); // Clean up resize listener
    }

    updateInputValueFromProps = () => {
        const {value, options} = this.props;
        const selected = options.find((opt) => opt.id === value.id);
        console.log("updateInputValueFromProps");
        if (selected) {
            this.setState({inputValue: selected.value});
        }
    };

    handleClickOutside = (e: MouseEvent) => {
        if (
            this.containerRef.current && !this.containerRef.current.contains(e.target as Node)
        ) {
            this.setState({showDropdown: false});
        }
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({inputValue: e.target.value, showDropdown: true});
    };

    handleSelect = (option: Option) => {
        this.props.onChange(option.id);
        this.setState({inputValue: option.value, showDropdown: false});
    };

    // New method to calculate dropdown position
    updateDropdownPosition = () => {
        if (this.inputRef.current) {
            const {bottom, left, width} = this.inputRef.current.getBoundingClientRect();
            this.setState({
                dropdownPosition: {top: bottom + window.scrollY, left: left + window.scrollX, width},
            });
        }
    };

    render() {
        const {options, placeholder} = this.props;
        const {inputValue, showDropdown, dropdownPosition} = this.state;

        const filtered = options.filter((opt) =>
            opt.value.toLowerCase().includes(inputValue.toLowerCase())
        );

        return (
            <div ref={this.containerRef} className="relative pointer-events-auto">
                <input
                    type="text"
                    ref={this.inputRef}
                    value={inputValue}
                    placeholder={placeholder || "Select..."}
                    className="w-20 h-5 border border-gray-300 rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onChange={this.handleInputChange}
                    onFocus={() => {
                        this.updateDropdownPosition()
                        this.setState({showDropdown: true})}
                    }
                />
                {showDropdown && filtered.length > 0 && (
                    <ul className="absolute mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto text-[10px] min-w-full"
                        style={{
                            top: dropdownPosition?.top,
                            left: dropdownPosition?.left,
                            width: dropdownPosition?.width,
                            zIndex: 9999,
                        }}
                        onWheelCapture={(e) => {
                            e.stopPropagation();
                        }}>
                        {filtered.map((opt) => (
                            <li
                                key={opt.id}
                                value={opt.id}
                                onClick={() => this.handleSelect(opt)}
                                className="px-3 py-1 whitespace-nowrap cursor-pointer hover:bg-blue-100 hover:text-blue-800">
                                {opt.value}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}
