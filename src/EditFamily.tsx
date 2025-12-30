import { type JSX, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthProps } from "./model/Props.ts";
import type { Person } from "./model/Person.ts";
import type { PersonRowDetail } from "./model/PersonRowDetail.ts";
import { RowState } from "./model/Constants.ts";
import ImagePreview from "./ImagePreview.tsx";
import { Edit, HardDrive, Plus, Save, Trash2, X, User, Briefcase, Mail, Calendar } from "lucide-react";
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
                            <Card key={row.id} className="w-full max-w-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl rounded-2xl border-border/60 overflow-hidden group">
                                <CardHeader className="p-0 relative">
                                    <div className="w-full h-48 bg-muted relative overflow-hidden">
                                        {rowDetails.get(row.id)?.editable ? (
                                            <div className="w-full h-full flex items-center justify-center bg-black/5 backdrop-blur-sm">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileInputChange(row.id, e.target.files)}
                                                    className="w-3/4 text-xs file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 transition-all cursor-pointer bg-white/50 rounded-lg p-2 shadow-sm backdrop-blur-md"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full">
                                                <ImagePreview buffer={imageMap.get(row.id)} yearOfDeath={row.yearOfDeath} />
                                            </div>
                                        )}

                                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {rowDetails.get(row.id)?.editable ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSaveRow(row.id)}
                                                        className="h-8 w-8 bg-green-500/90 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform active:scale-95"
                                                        title="Save"
                                                        aria-label="Save person"
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
                                                        aria-label="Edit person"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(row.id)}
                                                        className="h-8 w-8 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform active:scale-95"
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
                                <CardContent className="grid gap-3 p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">First Name</Label>
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="text"
                                                    value={row.firstName}
                                                    onChange={(e) => handleInputChange(row.id, "firstName", e.target.value)}
                                                    className="w-full bg-muted/30 border-b border-primary/20 focus:border-primary px-0 py-1 text-sm focus:outline-none transition-colors"
                                                    placeholder="First Name"
                                                />
                                            ) : (
                                                <p className="font-semibold text-sm truncate">{row.firstName}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 opacity-0"></div>
                                        <div className="flex-1 min-w-0">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Last Name</Label>
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="text"
                                                    value={row.lastName}
                                                    onChange={(e) => handleInputChange(row.id, "lastName", e.target.value)}
                                                    className="w-full bg-muted/30 border-b border-primary/20 focus:border-primary px-0 py-1 text-sm focus:outline-none transition-colors"
                                                    placeholder="Last Name"
                                                />
                                            ) : (
                                                <p className="font-semibold text-sm truncate">{row.lastName}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                                            <Briefcase className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Occupation</Label>
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="text"
                                                    value={row.occupation}
                                                    onChange={(e) => handleInputChange(row.id, "occupation", e.target.value)}
                                                    className="w-full bg-muted/30 border-b border-primary/20 focus:border-primary px-0 py-1 text-sm focus:outline-none transition-colors"
                                                    placeholder="Occupation"
                                                />
                                            ) : (
                                                <p className="font-medium text-sm truncate">{row.occupation}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Email</Label>
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="text"
                                                    value={row.email}
                                                    onChange={(e) => handleInputChange(row.id, "email", e.target.value)}
                                                    className="w-full bg-muted/30 border-b border-primary/20 focus:border-primary px-0 py-1 text-sm focus:outline-none transition-colors"
                                                    placeholder="Email"
                                                />
                                            ) : (
                                                <p className="font-medium text-sm truncate">{row.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-2 border-t border-border/50 mt-1">
                                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 flex-1">
                                            <div>
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Born</Label>
                                                {rowDetails.get(row.id)?.editable ? (
                                                    <input
                                                        type="text"
                                                        value={row.yearOfBirth}
                                                        onChange={(e) => handleInputChange(row.id, "yob", e.target.value)}
                                                        className="w-full bg-muted/30 border-b border-primary/20 focus:border-primary px-0 py-1 text-sm focus:outline-none transition-colors"
                                                        placeholder="Year"
                                                    />
                                                ) : (
                                                    <p className="font-medium text-sm">{row.yearOfBirth}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Died</Label>
                                                {rowDetails.get(row.id)?.editable ? (
                                                    <input
                                                        type="text"
                                                        value={row.yearOfDeath}
                                                        onChange={(e) => handleInputChange(row.id, "yod", e.target.value)}
                                                        className="w-full bg-muted/30 border-b border-primary/20 focus:border-primary px-0 py-1 text-sm focus:outline-none transition-colors"
                                                        placeholder="Year"
                                                    />
                                                ) : (
                                                    <p className="font-medium text-sm">{row.yearOfDeath}</p>
                                                )}
                                            </div>
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