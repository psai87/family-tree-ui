import {useState} from "react";
import {Home, User, Settings, Network} from "lucide-react";
import {HashRouter as Router, Route, Routes, Link} from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel, SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider, SidebarTrigger,

} from "@/components/ui/sidebar";
import LoginPage from "@/LoginPage.tsx";
import ViewFamily from "@/ViewFamily.tsx";
import EditFamily from "@/EditFamily.tsx";
import EditWorkspace from "@/EditWorkspace.tsx";
import {Breadcrumb, BreadcrumbItem, BreadcrumbList} from "@/components/ui/breadcrumb.tsx";
import type {NavItem} from "@/model/NavItem.ts";
import {Toaster} from "sonner";


function SideBar() {
    const [authenticated, setAuthenticated] = useState<boolean>(false)
    const [selectedGroup, setSelectedGroup] = useState<string>("Login")
    const navItems = new Map<string, Array<NavItem>>([["Family Tree", [
        {label: "View Family", icon: Network, path: "/view-family"},
        {label: "Edit People", icon: User, path: "/edit-people"},
        {label: "Edit Workspace", icon: Settings, path: "/edit-workspace"},
    ]]]);

    return (
        <Router>
            <SidebarProvider defaultOpen>

                    {/* Sidebar */}
                    <Sidebar collapsible="icon" className="bg-navy text-light-orange shadow-lg shadow-gray-900/50">
                        {/* Sidebar header */}
                        <SidebarHeader className="bg-[#0a1a3c] text-white">
                            <SidebarMenu>
                                <SidebarMenuItem key="login">
                                    <SidebarMenuButton asChild className="hover:bg-gray-500 hover:text-white font-oswald text-xl">
                                        <Link to={"/"} onClick={() => setSelectedGroup("Login")} className="text-white">
                                            <Home className="text-xl w-5 h-5"/>
                                            Login
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarHeader>

                        {/* Sidebar content */
                        }
                        <SidebarContent className="overflow-visible bg-[#0a1a3c] text-white text-xl">
                            {authenticated &&
                                Array.from(navItems).map(([group, items]) => (
                                    <SidebarGroup key={group}>
                                        <SidebarGroupLabel className="text-white">{group}</SidebarGroupLabel>
                                        <SidebarGroupContent>
                                            <SidebarMenu>
                                                {items.map((item) => (
                                                    <SidebarMenuItem key={item.label}>
                                                        <SidebarMenuButton asChild
                                                                           className="hover:bg-gray-500 hover:text-white font-oswald text-xl">
                                                            <Link
                                                                to={item.path}
                                                                onClick={() => setSelectedGroup(group)}
                                                                className="flex items-center gap-2 text-white"
                                                            >
                                                                <item.icon />
                                                                {item.label}
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ))}
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </SidebarGroup>
                                ))}
                        </SidebarContent>
                    </Sidebar>

                    {/* Main content */
                    }
                    <main className="flex-1 p-2 bg-light-orange font-oswald flex flex-col">
                        <div className="flex items-center gap-4 mb-2">
                            <SidebarTrigger/>
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <span className="text-xl font-oswald text-orange-700 font-bold">{selectedGroup}</span>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        {/* Scrollable content area */}
                        <div className="flex-1 overflow-y-auto">
                            <Routes>
                                <Route
                                    path="/"
                                    element={<LoginPage setAuthenticated={setAuthenticated}/>}
                                />
                                <Route path="/view-family" element={<ViewFamily/>}/>
                                <Route path="/edit-people" element={<EditFamily/>}/>
                                <Route path="/edit-workspace" element={<EditWorkspace/>}/>
                            </Routes>
                        </div>
                    </main>

                    <Toaster position="top-right" richColors closeButton/>

            </SidebarProvider>
        </Router>
    )
        ;
}

export default SideBar