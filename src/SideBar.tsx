import HomePage from "./HomePage.tsx";
import EditFamily from "./EditFamily.tsx";
import ViewFamily from "./ViewFamily.tsx";
import {type JSX, useState} from "react";
import {Menu, Home, User, Settings, X} from "lucide-react";

function SideBar() {
    const [isOpen, setIsOpen] = useState(true);
    const [activePage, setActivePage] = useState<string>("HomePage");
    const toggleSidebar = () => setIsOpen(!isOpen);
    const pages : Record<string, JSX.Element> = {
        "HomePage": <HomePage/>,
        "ViewFamily": <ViewFamily/>,
        "EditFamily": <EditFamily/>,
    };
    const navItems = [
        {label: "Home Page", icon: <Home/>, page: "HomePage"},
        {label: "View Family", icon: <User/>, page: "ViewFamily"},
        {label: "Edit Family", icon: <Settings/>, page: "EditFamily"},
    ];

    return (
        <>
            <div className="flex">
                <div
                    className={`transition-all duration-300 ${
                        isOpen ? "w-64" : "w-16"
                    } bg-gray-900 min-h-screen text-white flex flex-col`}
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        {isOpen && <h1 className="text-xl font-bold">Family-Tree</h1>}
                        <button onClick={toggleSidebar}>{isOpen ? <X/> : <Menu/>}</button>
                    </div>
                    <ul className="mt-4 flex-1">
                        {navItems.map((item) => (
                            <li
                                key={item.label}
                                onClick={() => setActivePage(item.page)}
                                className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-700 cursor-pointer ${
                                    activePage === item.page ? "bg-gray-700" : ""
                                }`}
                            >
                                {item.icon}
                                {isOpen && <span>{item.label}</span>}
                            </li>
                        ))}
                    </ul>
                </div>


                <div className="flex-1 bg-gray-100 min-h-screen">
                    {pages[activePage]}
                </div>
            </div>
        </>
    );
}

export default SideBar