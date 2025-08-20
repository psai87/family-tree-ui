import React, {Component, createRef, type Dispatch, type SetStateAction} from "react";

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
    setShowDropdown: Dispatch<SetStateAction<boolean>>;
};

// State type
type AutocompleteSelectState = {
    inputValue: string;
    showDropdown: boolean;
};

export class AutocompleteSelect extends Component<AutocompleteSelectProps, AutocompleteSelectState> {
    containerRef: React.RefObject<HTMLDivElement | null>;

    constructor(props: AutocompleteSelectProps) {
        super(props);
        this.state = {inputValue: "", showDropdown: false};
        this.containerRef = createRef();
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.handleClickOutside, true);
        this.updateInputValueFromProps();
    }

    componentDidUpdate(prevProps: AutocompleteSelectProps) {
        if (prevProps.value.id !== this.props.value.id) {
            this.updateInputValueFromProps();
        }
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleClickOutside, true);
    }

    updateInputValueFromProps = () => {
        const {value, options} = this.props;
        const selected = options.find((opt) => opt.id === value.id);
        if (selected) {
            this.setState({inputValue: selected.value});
        }
    };

    handleClickOutside = (e: MouseEvent) => {
        if (
            this.containerRef.current && !this.containerRef.current.contains(e.target as Node)
        ) {
            this.props.setShowDropdown(false);
            this.setState({showDropdown: false});
        }
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.setShowDropdown(true);
        this.setState({inputValue: e.target.value, showDropdown: true});
    };

    handleSelect = (option: Option) => {
        this.props.onChange(option.id);
        this.props.setShowDropdown(false);
        this.setState({inputValue: option.value, showDropdown: false});
    };

    render() {
        const {options, placeholder, setShowDropdown} = this.props;
        const {inputValue, showDropdown} = this.state;

        const filtered = options.filter((opt) =>
            opt.value.toLowerCase().includes(inputValue.toLowerCase())
        );

        return (
            <div ref={this.containerRef} className="relative pointer-events-auto z-[999999] ">
                <input
                    type="text"
                    value={inputValue}
                    placeholder={placeholder || "Select..."}
                    className="w-15 h-5 border border-gray-300 rounded-md p-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none nodrag nowheel nopan"
                    onChange={this.handleInputChange}
                    onFocus={() => {
                        setShowDropdown(true)
                        this.setState({showDropdown: true})
                    }}
                />
                {showDropdown && filtered.length > 0 && (
                    <ul className="absolute mt-1 z-[999999] bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto text-[10px] min-w-full nodrag nowheel">
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
