import { type ChangeEvent, type JSX, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthProps } from "./model/Props.ts";
import type { PersonRowDetail } from "./model/PersonRowDetail.ts";
import { RowState } from "./model/Constants.ts";
import PeopleRelationService from "./service/PeopleRelationService.ts";
import type { Workspace } from "./model/Workspace.ts";
import { Edit, HardDrive, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardAction } from "./components/ui/card.tsx";
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
                        className="flex flex-col md:flex-row md:flex-wrap gap-6 overflow-y-auto px-6 py-4 content-start">
                        {rowWorkspaces.map((row) => (
                            <Card key={row.id} className="w-full max-w-xs">
                                <CardHeader>
                                    <Label className="font-bold">workspace</Label>
                                    {rowDetails.get(row.id)?.editable ? (
                                        <input
                                            type="text"
                                            value={row.name}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                handleInputChange(row.id, "name", e.target.value)
                                            }
                                            className="w-full border border-border px-3 py-1 rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                        />
                                    ) : (
                                        <span className="text-foreground break-all">{row.name}</span>
                                    )}
                                    <CardAction>
                                        <div className="inline-flex gap-2">
                                            {rowDetails.get(row.id)?.editable ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSaveRow(row.id)}
                                                        className="text-sm bg-green-500 text-white p-2 rounded hover:bg-green-600 transition flex items-center justify-center shadow-md active:scale-95"
                                                        title="Save"
                                                        aria-label="Save workspace"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(row.id)}
                                                        className="text-sm bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition flex items-center justify-center shadow-md active:scale-95"
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
                                                        className="text-sm bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition flex items-center justify-center shadow-md active:scale-95"
                                                        title="Edit"
                                                        aria-label="Edit workspace"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(row.id)}
                                                        className="text-sm bg-red-500 text-white p-2 rounded hover:bg-red-600 transition flex items-center justify-center shadow-md active:scale-95"
                                                        title="Remove"
                                                        aria-label="Remove workspace"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </CardAction>
                                </CardHeader>
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