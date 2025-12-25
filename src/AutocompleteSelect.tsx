import { Component, createRef, type Dispatch, type SetStateAction } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Check } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command.tsx";
import { cn } from "@/lib/utils.ts";


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
    setShowDropdown: Dispatch<SetStateAction<boolean>>;
};

// State type for the class component
type AutocompleteSelectState = {
    open: boolean;
};

export class AutocompleteSelect extends Component<AutocompleteSelectProps, AutocompleteSelectState> {
    containerRef: React.RefObject<HTMLDivElement | null>;

    constructor(props: AutocompleteSelectProps) {
        super(props);
        this.state = { open: false };
        this.containerRef = createRef();
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.handleClickOutside, true);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleClickOutside, true);
    }

    handleClickOutside = (e: MouseEvent) => {
        if (
            this.containerRef.current && !this.containerRef.current.contains(e.target as Node)
        ) {
            this.props.setShowDropdown(false);
        }
    };

    handleSelect = (option: Option) => {
        this.props.onChange(option.id);
        this.props.setShowDropdown(false);
        this.setState({ open: false });
    };

    setOpen = (newOpenState: boolean) => {
        this.setState({ open: newOpenState });
    };

    render() {
        const { options, value } = this.props;
        const { open } = this.state;


        return (
            <div ref={this.containerRef}>
                <Popover open={open} onOpenChange={this.setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            onClick={() => {
                                this.props.setShowDropdown(true);
                            }}
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-[60px] h-5 justify-between border border-border text-xs px-2 py-1 truncate focus:ring-2 focus:ring-primary/50 focus:outline-none bg-card hover:bg-accent"
                        >
                            {value.value}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0 ">
                        <Command>
                            <CommandInput placeholder="Search..." className="text-xs" />
                            <CommandList>
                                <CommandEmpty>Not found.</CommandEmpty>
                                <CommandGroup>
                                    {options.map((opt) => (
                                        <CommandItem
                                            className="px-1 py-1 text-xs"
                                            key={opt.value}
                                            value={opt.value}
                                            onSelect={() => this.handleSelect(opt)}
                                        >
                                            {opt.value}
                                            <Check
                                                className={cn(
                                                    "ml-auto",
                                                    value.id === opt.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        );
    }
}
