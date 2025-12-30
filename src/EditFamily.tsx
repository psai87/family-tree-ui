import { type JSX, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthProps } from "./model/Props.ts";
import type { Person } from "./model/Person.ts";
import type { PersonRowDetail } from "./model/PersonRowDetail.ts";
import { RowState } from "./model/Constants.ts";
import ImagePreview from "./ImagePreview.tsx";
import { Edit, HardDrive, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import ServiceFactory from "./service/ServiceFactory.ts";
import { updateMapEntry, deleteMapEntry } from "./utils/mapHelpers.ts";
import { Card, CardHeader, CardContent } from "./components/ui/card.tsx";
import { Label } from "./components/ui/label.tsx";


function EditFamily({ setAuthenticated }: AuthProps): JSX.Element {
    const navigate = useNavigate();
    const peopleRelationService = ServiceFactory.getPeopleRelationService();
    const [rowPersons, setRowPersons] = useState<Person[]>([])
    const [rowDetails, setRowDetails] = useState<Map<string, PersonRowDetail>>(new Map<string, PersonRowDetail>())
    const [tempRowPersons, setTempRowPersons] = useState<Map<string, Person>>(new Map<string, Person>())
    const [imageMap, setImageMap] = useState<Map<string, ArrayBuffer>>(new Map<string, ArrayBuffer>())
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    useEffect(() => {
        if (shouldScroll && containerRef.current) {
            containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
            setShouldScroll(false);
        }
    }, [rowPersons, shouldScroll]);


    useEffect(() => {
        peopleRelationService.getPersons()
            .then(async response => {
                setRowPersons(response[0])
                setRowDetails(response[1])
                // Fetch images for all persons using helper
                const imageMap = await peopleRelationService.loadImagesForPersons(response[0]);
                setImageMap(imageMap);
            })
            .catch(error => {
                console.log(error)
                if (error.message === "Unauthorized") {
                    setAuthenticated(false);
                    navigate("/");
                }
                toast.error("Failed to load persons");
            })
    }, []);

    const handleAddRow = () => {
        const newPerson: Person = {
            id: crypto.randomUUID(),
            firstName: "",
            lastName: "",
            occupation: "",
            email: "",
            yearOfBirth: -1,
            yearOfDeath: -1
        };
        const newPersonRowDetail: PersonRowDetail = {
            editable: false,
            state: RowState.Added
        }
        setRowPersons([...rowPersons, newPerson]);
        setRowDetails(prevMap => updateMapEntry(prevMap, newPerson.id, newPersonRowDetail));
        setShouldScroll(true);
    };

    const handleSaveAll = (): void => {
        console.log("Saving data");
        peopleRelationService.savePersons(rowPersons, rowDetails, imageMap)
            .then(async _ => {
                const response = await peopleRelationService.getPersons();
                setRowPersons(response[0])
                setRowDetails(response[1])
                // Reload images using helper
                const imageMap = await peopleRelationService.loadImagesForPersons(response[0]);
                setImageMap(imageMap);
                toast.success("Saved successfully")
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
            updateMapEntry(prevMap, id, { ...prevMap.get(id) as PersonRowDetail, editable: true }));
        setTempRowPersons(prevMap =>
            updateMapEntry(prevMap, id, rowPersons.find(data => data.id === id) as Person));
    };

    const handleCancel = (id: string): void => {
        setRowDetails(prevMap =>
            updateMapEntry(prevMap, id, { ...prevMap.get(id) as PersonRowDetail, editable: false }));
        setRowPersons(prevMap => prevMap.filter(person => person.id !== id)
            .concat(tempRowPersons.get(id) as Person));
        setTempRowPersons(prevMap => deleteMapEntry(prevMap, id));
    };

    const handleRemove = (id: string): void => {
        setRowDetails(prevMap => {
            if (prevMap.get(id)?.state == RowState.Added) {
                return deleteMapEntry(prevMap, id);
            } else {
                return updateMapEntry(prevMap, id, { ...prevMap.get(id) as PersonRowDetail, state: RowState.Deleted });
            }
        })
        setRowPersons(prevMap => prevMap.filter(person => person.id !== id))
        setTempRowPersons(prevMap => deleteMapEntry(prevMap, id));
    };

    const handleInputChange = (
        id: string,
        field: string,
        value: string
    ): void => {
        setRowPersons((prev) =>
            prev.map((row: Person) =>
                row.id === id ? { ...row, [field]: value } : row
            ));
    }

    const handleFileInputChange = (
        id: string,
        value: FileList | null
    ): void => {
        getFileBytes(value).then(response => {
            setImageMap(prevMap => updateMapEntry(prevMap, id, response));
        })
    }

    async function getFileBytes(value: FileList | null): Promise<ArrayBuffer> {
        const bytes = await value?.item(0)?.arrayBuffer() ?? new ArrayBuffer(0);
        return bytes;
    }

    const handleSaveRow = (id: string): void => {
        setRowDetails(prevMap => {
            const prevDetail: PersonRowDetail = prevMap.get(id) as PersonRowDetail;
            return updateMapEntry(prevMap, id, {
                ...prevDetail,
                editable: false,
                state: prevDetail?.state === RowState.Added ? RowState.Added : RowState.Edited,
            });
        });
        setTempRowPersons(prevMap => deleteMapEntry(prevMap, id));
    };

    return (
        <>
            <div className="h-full bg-muted md:p-4 overflow-hidden">
                <div
                    className="max-w-full mx-auto bg-card shadow-2xl rounded-2xl border border-border flex flex-col h-full">

                    <div
                        ref={containerRef}
                        className="flex flex-col md:flex-row md:flex-wrap gap-6 overflow-y-auto px-6 py-4 content-start">
                        {rowPersons.map((row) => (
                            <Card key={row.id} className="w-full max-w-xs">
                                <CardHeader className="p-0 relative">
                                    <div className="col-span-1 w-full h-48 relative bg-muted overflow-hidden flex items-center justify-center">
                                        {rowDetails.get(row.id)?.editable ? (
                                            <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileInputChange(row.id, e.target.files)}
                                                    className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-colors cursor-pointer"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full">
                                                <ImagePreview buffer={imageMap.get(row.id)} yearOfDeath={row.yearOfDeath} />
                                            </div>
                                        )}

                                        <div className="absolute top-2 right-2 flex gap-2">
                                            {rowDetails.get(row.id)?.editable ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSaveRow(row.id)}
                                                        className="text-sm bg-green-500 text-white p-2 rounded hover:bg-green-600 transition flex items-center justify-center shadow-md active:scale-95"
                                                        title="Save"
                                                        aria-label="Save person"
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
                                                        aria-label="Edit person"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(row.id)}
                                                        className="text-sm bg-red-500 text-white p-2 rounded hover:bg-red-600 transition flex items-center justify-center shadow-md active:scale-95"
                                                        title="Remove"
                                                        aria-label="Remove person"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid gap-2">
                                    <div>
                                        <Label className="text-muted-foreground font-bold"> First Name </Label>
                                        {rowDetails.get(row.id)?.editable ? (
                                            <input
                                                type="text"
                                                value={row.firstName}
                                                onChange={(e) => handleInputChange(row.id, "firstName", e.target.value)}
                                                className="w-full border border-border px-3 py-1 rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none h-9"
                                            />
                                        ) : (
                                            <div className="flex items-center h-9 w-full px-3 border border-transparent">
                                                <span className="text-foreground break-all">{row.firstName}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground font-bold"> Last Name </Label>
                                        {rowDetails.get(row.id)?.editable ? (
                                            <input
                                                type="text"
                                                value={row.lastName}
                                                onChange={(e) => handleInputChange(row.id, "lastName", e.target.value)}
                                                className="w-full border border-border px-3 py-1 rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none h-9"
                                            />
                                        ) : (
                                            <div className="flex items-center h-9 w-full px-3 border border-transparent">
                                                <span className="text-foreground break-all">{row.lastName}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground font-bold"> Occupation </Label>
                                        {rowDetails.get(row.id)?.editable ? (
                                            <input
                                                type="text"
                                                value={row.occupation}
                                                onChange={(e) => handleInputChange(row.id, "occupation", e.target.value)}
                                                className="w-full border border-border px-3 py-1 rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none h-9"
                                            />
                                        ) : (
                                            <div className="flex items-center h-9 w-full px-3 border border-transparent">
                                                <span className="text-foreground break-all">{row.occupation}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label className="text-muted-foreground font-bold"> Email </Label>
                                        {rowDetails.get(row.id)?.editable ? (
                                            <input
                                                type="text"
                                                value={row.email}
                                                onChange={(e) => handleInputChange(row.id, "email", e.target.value)}
                                                className="w-full border border-border px-3 py-1 rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none h-9"
                                            />
                                        ) : (
                                            <div className="flex items-center h-9 w-full px-3 border border-transparent">
                                                <span className="text-foreground break-all">{row.email}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-muted-foreground font-bold"> YOB </Label>
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="text"
                                                    value={row.yearOfBirth}
                                                    onChange={(e) => handleInputChange(row.id, "yob", e.target.value)}
                                                    className="w-full border border-border px-3 py-1 rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none h-9"
                                                />
                                            ) : (
                                                <div className="flex items-center h-9 w-full px-3 border border-transparent">
                                                    <span>{row.yearOfBirth}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <Label className="text-muted-foreground font-bold"> YOD </Label>
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="text"
                                                    value={row.yearOfDeath}
                                                    onChange={(e) => handleInputChange(row.id, "yod", e.target.value)}
                                                    className="w-full border border-border px-3 py-1 rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none h-9"
                                                />
                                            ) : (
                                                <div className="flex items-center h-9 w-full px-3 border border-transparent">
                                                    <span>{row.yearOfDeath}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4 mt-auto py-6 px-6 bg-muted/20 border-t border-border">
                        <button
                            onClick={handleAddRow}
                            className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 shadow-lg active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" /> Add Record
                        </button>
                        <button
                            onClick={handleSaveAll}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-700 shadow-lg active:scale-95 transition-all flex items-center gap-2"
                        >
                            <HardDrive className="h-5 w-5" /> Save All
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditFamily