import { useState } from "react";
import { Home, User, Settings, Network } from "lucide-react";
import { HashRouter as Router, Route, Routes, Link } from "react-router-dom";
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
import { ReactFlowProvider } from "@xyflow/react";
import LoginPage from "@/LoginPage.tsx";
import ViewFamily from "@/ViewFamily.tsx";
import EditFamily from "@/EditFamily.tsx";
import EditWorkspace from "@/EditWorkspace.tsx";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb.tsx";
import type { NavItem } from "@/model/NavItem.ts";
import { Toaster } from "sonner";
import './font.css'

function SideBar() {
    const [authenticated, setAuthenticated] = useState<boolean>(false)
    const [selectedGroup, setSelectedGroup] = useState<string>("Login")
    const navItems = new Map<string, Array<NavItem>>([["Family Tree", [
        { label: "View Family", icon: Network, path: "/view-family" },
        { label: "Edit People", icon: User, path: "/edit-people" },
        { label: "Edit Workspace", icon: Settings, path: "/edit-workspace" },
    ]]]);

    return (
        <div className="flex h-dvh">
            <Router>
                <SidebarProvider defaultOpen>

                    {/* Sidebar */}
                    <Sidebar collapsible="icon"
                        className="bg-sidebar text-sidebar-foreground shadow-lg shadow-black/20 h-full border-r border-sidebar-border">
                        {/* Sidebar header */}
                        <SidebarHeader className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border/50">
                            <SidebarMenu >
                                <SidebarMenuItem key="login" >
                                    <SidebarMenuButton asChild

                                        className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-oswald text-[1.1rem] h-[3rem] [&>svg]:h-5 [&>svg]:w-5 transition-colors duration-200">
                                        <Link to={"/"} onClick={() => setSelectedGroup("Login")} className="flex items-center gap-3">
                                            <Home className="text-primary" />
                                            <span>Login</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarHeader>

                        {/* Sidebar content */
                        }
                        <SidebarContent className="overflow-visible bg-sidebar text-sidebar-foreground">
                            {authenticated &&
                                Array.from(navItems).map(([group, items]) => (
                                    <SidebarGroup key={group}>
                                        <SidebarGroupLabel className="text-sidebar-foreground/70 text-[0.8rem] uppercase tracking-wider h-[2rem] px-4">{group}</SidebarGroupLabel>
                                        <SidebarGroupContent>
                                            <SidebarMenu>
                                                {items.map((item) => (
                                                    <SidebarMenuItem key={item.label}>
                                                        <SidebarMenuButton asChild
                                                            className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-oswald text-[1.1rem] h-[3rem] [&>svg]:h-5 [&>svg]:w-5 transition-colors duration-200">
                                                            <Link
                                                                to={item.path}
                                                                onClick={() => setSelectedGroup(group)}
                                                                className="flex items-center gap-3"
                                                            >
                                                                <item.icon className="text-primary" />
                                                                <span>{item.label}</span>
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
                    <main className="flex-1 flex flex-col p-4 bg-background font-oswald overflow-hidden h-screen">
                        <div className="flex items-center gap-4 mb-4 flex-none">
                            <SidebarTrigger className="text-primary hover:bg-accent" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <span
                                            className="text-2xl font-oswald text-primary font-extrabold uppercase tracking-tight">{selectedGroup}</span>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
                        </div>
                        {/* Content area - child components handle their own scrolling */}
                        <div className="flex-1 min-h-0 w-full relative">
                            <Routes>
                                <Route
                                    path="/"
                                    element={<LoginPage setAuthenticated={setAuthenticated} />}
                                />
                                <Route path="/view-family" element={
                                    <ReactFlowProvider>
                                        <ViewFamily />
                                    </ReactFlowProvider>
                                } />
                                <Route path="/edit-people" element={<EditFamily />} />
                                <Route path="/edit-workspace" element={<EditWorkspace />} />
                            </Routes>
                        </div>
                    </main>

                    <Toaster position="top-right" richColors closeButton />

                </SidebarProvider>
            </Router>
        </div>
    );
}

export default SideBar