import { type ChangeEvent, type JSX, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthProps } from "./model/Props.ts";
import type { PersonRowDetail } from "./model/PersonRowDetail.ts";
import { RowState } from "./model/Constants.ts";
import PeopleRelationService from "./service/PeopleRelationService.ts";
import type { Workspace } from "./model/Workspace.ts";
import { Edit, HardDrive, Plus, Save, Trash2, X, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader } from "./components/ui/card.tsx";
import { Label } from "./components/ui/label.tsx";

function EditWorkspace({ setAuthenticated }: AuthProps): JSX.Element {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    const peopleRelationService: PeopleRelationService = new PeopleRelationService();
    const [rowWorkspaces, setRowWorkspaces] = useState<Workspace[]>([])
    const [rowDetails, setRowDetails] = useState<Map<string, PersonRowDetail>>(new Map<string, PersonRowDetail>())
    const [tempRowWorkspaces, setTempRowWorkspaces] = useState<Map<string, Workspace>>(new Map<string, Workspace>())

    useEffect(() => {
        peopleRelationService.getWorkspaces()
            .then(response => {
                setRowWorkspaces(response[0])
                setRowDetails(response[1])
            })
            .catch(error => {
                console.log(error)
                if (error.message === "Unauthorized") {
                    setAuthenticated(false);
                    navigate("/");
                }
                toast.error("Failed to load workspaces")
            })
    }, []);

    useEffect(() => {
        if (shouldScroll && containerRef.current) {
            containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
            setShouldScroll(false);
        }
    }, [rowWorkspaces, shouldScroll]);

    const handleAddRow = () => {
        const newWorkspace: Workspace = {
            id: crypto.randomUUID(),
            name: "",
        };
        const newPersonRowDetail: PersonRowDetail = {
            editable: false,
            state: RowState.Added
        }
        setRowWorkspaces([...rowWorkspaces, newWorkspace]);
        setRowDetails(prevMap => new Map(prevMap).set(newWorkspace.id, newPersonRowDetail));
        setShouldScroll(true);
    };

    const handleSaveAll = (): void => {
        console.log("Saving data");
        peopleRelationService.saveWorkspaces(rowWorkspaces, rowDetails)
            .then(_ => {
                peopleRelationService.getWorkspaces()
                    .then(response => {
                        setRowWorkspaces(response[0])
                        setRowDetails(response[1])
                    })
                    .catch(error => {
                        console.log(error)
                        if (error.message === "Unauthorized") {
                            setAuthenticated(false);
                            navigate("/");
                        }
                        toast.error("Failed to refresh workspaces")
                    })
                toast.success("Saved Successfully")
            })
            .catch(reason => {
                console.log(reason)
                if (reason.message === "Unauthorized") {
                    setAuthenticated(false);
                    navigate("/");
                }
                toast.error(reason.message)
            });
    };

    const handleEdit = (id: string): void => {
        setRowDetails(prevMap =>
            new Map(prevMap).set(id, { ...prevMap.get(id) as PersonRowDetail, editable: true }));
        setTempRowWorkspaces(prevMap =>
            new Map(prevMap).set(id, rowWorkspaces.find(data => data.id === id) as Workspace));
    };

    const handleCancel = (id: string): void => {
        setRowDetails(prevMap =>
            new Map(prevMap).set(id, { ...prevMap.get(id) as PersonRowDetail, editable: false }));
        setRowWorkspaces(prevMap => prevMap.filter(person => person.id !== id)
            .concat(tempRowWorkspaces.get(id) as Workspace));
        setTempRowWorkspaces(prevMap => {
            const newMap = new Map(prevMap);
            newMap.delete(id)
            return newMap;
        })
    };

    const handleRemove = (id: string): void => {
        setRowDetails(prevMap => {
            const newMap = new Map(prevMap);
            if (newMap.get(id)?.state == RowState.Added) {
                newMap.delete(id)
            } else {
                newMap.set(id, { ...newMap.get(id) as PersonRowDetail, state: RowState.Deleted });
            }
            return newMap;
        })
        setRowWorkspaces(prevMap => prevMap.filter(person => person.id !== id))
        setTempRowWorkspaces(prevMap => {
            const newMap = new Map(prevMap);
            newMap.delete(id)
            return newMap;
        })
    };

    const handleInputChange = (
        id: string,
        field: string,
        value: string
    ): void => {
        setRowWorkspaces((prev) =>
            prev.map((row: Workspace) =>
                row.id === id ? { ...row, [field]: value } : row
            ));
    }

    const handleSaveRow = (id: string): void => {
        setRowDetails(prevMap => {
            const prevDetail: PersonRowDetail = prevMap.get(id) as PersonRowDetail;
            return new Map(prevMap).set(id, {
                ...prevDetail,
                editable: false,
                state: prevDetail?.state === RowState.Added ? RowState.Added : RowState.Edited,
            });
        });
        setTempRowWorkspaces(prevMap => {
            const newMap = new Map(prevMap);
            newMap.delete(id)
            return newMap;
        })
    };

    return (
        <>
            <div className="h-full bg-muted md:p-4 overflow-hidden">
                <div
                    className="max-w-full mx-auto bg-card shadow-2xl rounded-2xl border border-border flex flex-col h-full">

                    <div
                        ref={containerRef}
                        className="flex flex-col md:flex-row md:flex-wrap gap-6 overflow-y-auto px-6 py-4 content-start flex-1 min-h-0">
                        {rowWorkspaces.map((row) => (
                            <Card key={row.id} className="w-full max-w-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl rounded-2xl border-border/60 overflow-hidden group shrink-0">
                                <CardHeader className="p-0 relative">
                                    <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden flex items-center justify-center">
                                        <div className="h-16 w-16 text-primary/20 group-hover:text-primary/30 transition-colors duration-500">
                                            <FolderKanban className="w-full h-full" />
                                        </div>

                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {rowDetails.get(row.id)?.editable ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSaveRow(row.id)}
                                                        className="h-8 w-8 bg-green-500/90 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform active:scale-95"
                                                        title="Save"
                                                        aria-label="Save workspace"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(row.id)}
                                                        className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform active:scale-95"
                                                        title="Cancel"
                                                        aria-label="Cancel edit"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(row.id)}
                                                        className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform active:scale-95"
                                                        title="Edit"
                                                        aria-label="Edit workspace"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(row.id)}
                                                        className="h-8 w-8 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform active:scale-95"
                                                        title="Remove"
                                                        aria-label="Remove workspace"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <FolderKanban className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Workspace Name</Label>
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="text"
                                                    value={row.name}
                                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                        handleInputChange(row.id, "name", e.target.value)
                                                    }
                                                    className="w-full bg-muted/30 border-b border-primary/20 focus:border-primary px-0 py-1 text-sm focus:outline-none transition-colors"
                                                    placeholder="Workspace Name"
                                                />
                                            ) : (
                                                <p className="font-semibold text-lg truncate text-foreground">{row.name}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4 mt-auto py-6 px-6 bg-muted/20 border-t border-border">
                        <button
                            onClick={handleAddRow}
                            className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 shadow-lg active:scale-95 transition-all flex items-center gap-2"
                            aria-label="Add new record"
                        >
                            <Plus className="h-5 w-5" /> Add Record
                        </button>
                        <button
                            onClick={handleSaveAll}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-700 shadow-lg active:scale-95 transition-all flex items-center gap-2"
                            aria-label="Save all changes"
                        >
                            <HardDrive className="h-5 w-5" /> Save All
                        </button>
                    </div>
                </div>
            </div >
        </>
    );
}

export default EditWorkspace