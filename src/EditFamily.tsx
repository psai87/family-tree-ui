import { type JSX, useEffect, useState } from "react";
import type { Person } from "./model/Person.ts";
import type { PersonRowDetail } from "./model/PersonRowDetail.ts";
import { RowState } from "./model/Constants.ts";
import ImagePreview from "./ImagePreview.tsx";
import { Edit, HardDrive, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import ServiceFactory from "./service/ServiceFactory.ts";
import { updateMapEntry, deleteMapEntry } from "./utils/mapHelpers.ts";


function EditFamily(): JSX.Element {
    const peopleRelationService = ServiceFactory.getPeopleRelationService();
    const [rowPersons, setRowPersons] = useState<Person[]>([])
    const [rowDetails, setRowDetails] = useState<Map<string, PersonRowDetail>>(new Map<string, PersonRowDetail>())
    const [tempRowPersons, setTempRowPersons] = useState<Map<string, Person>>(new Map<string, Person>())
    const [imageMap, setImageMap] = useState<Map<string, ArrayBuffer>>(new Map<string, ArrayBuffer>())

    useEffect(() => {
        peopleRelationService.getPersons()
            .then(async response => {
                setRowPersons(response[0])
                setRowDetails(response[1])
                // Fetch images for all persons using helper
                const imageMap = await peopleRelationService.loadImagesForPersons(response[0]);
                setImageMap(imageMap);
            })
            .catch(error => console.log(error))
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

                    {/* Table */}
                    <div className="h-full overflow-auto px-6 py-4">
                        <table className="h-full min-w-full text-base text-foreground border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-left text-lg rounded-xl shadow-lg bg-secondary/90 text-white backdrop-blur-sm">
                                    <th className="px-4 py-2 font-semibold ">First Name</th>
                                    <th className="px-4 py-2 font-semibold whitespace-nowrap">Last Name</th>
                                    <th className="px-4 py-2 font-semibold ">Occupation</th>
                                    <th className="px-4 py-2 font-semibold ">Email</th>
                                    <th className="px-4 py-2 font-semibold ">YOB</th>
                                    <th className="px-4 py-2 font-semibold ">YOD</th>
                                    <th className="px-4 py-2 font-semibold ">Image</th>
                                    <th className="px-4 py-2 text-right font-semibold ">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rowPersons.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="bg-card hover:bg-accent/30 transition-all duration-200 rounded-xl shadow-sm border border-border"
                                    >
                                        <td className="px-4 py-2">
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="text"
                                                    value={row.firstName}
                                                    onChange={(e) => handleInputChange(row.id, "firstName", e.target.value)}
                                                    className="w-full border border-border px-3 py-1 rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                                />
                                            ) : (
                                                <span>{row.firstName}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="text"
                                                    value={row.lastName}
                                                    onChange={(e) => handleInputChange(row.id, "lastName", e.target.value)}
                                                    className="w-full border border-border px-3 py-1 rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                                />
                                            ) : (
                                                <span>{row.lastName}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="text"
                                                    value={row.occupation}
                                                    onChange={(e) => handleInputChange(row.id, "occupation", e.target.value)}
                                                    className="w-full border border-border px-3 py-1 rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                                />
                                            ) : (
                                                <span>{row.occupation}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="text"
                                                    value={row.email}
                                                    onChange={(e) => handleInputChange(row.id, "email", e.target.value)}
                                                    className="w-full border border-border px-3 py-1 rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                                />
                                            ) : (
                                                <span>{row.email}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="text"
                                                    value={row.yearOfBirth}
                                                    onChange={(e) => handleInputChange(row.id, "yearOfBirth", e.target.value)}
                                                    className="w-full border border-border px-3 py-1 rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                                />
                                            ) : (
                                                <span>{row.yearOfBirth}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="text"
                                                    value={row.yearOfDeath}
                                                    onChange={(e) => handleInputChange(row.id, "yearOfDeath", e.target.value)}
                                                    className="w-full border border-border px-3 py-1 rounded-md focus:ring-2 focus:ring-primary/50 focus:outline-none"
                                                />
                                            ) : (
                                                <span>{row.yearOfDeath}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2">
                                            {rowDetails.get(row.id)?.editable ? (
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileInputChange(row.id, e.target.files)}
                                                    className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-colors cursor-pointer"
                                                />
                                            ) : (
                                                <div
                                                    className="text-xs rounded-lg w-12 h-12 flex justify-center items-center bg-muted overflow-hidden shadow-inner border border-border">
                                                    <ImagePreview buffer={imageMap.get(row.id)} yearOfDeath={row.yearOfDeath} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="inline-flex gap-2">
                                                {rowDetails.get(row.id)?.editable ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSaveRow(row.id)}
                                                            className="text-sm bg-green-500 text-white p-2 rounded hover:bg-green-600 transition flex items-center justify-center"
                                                            title="Save"
                                                        >
                                                            <Save className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(row.id)}
                                                            className="text-sm bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition flex items-center justify-center"
                                                            title="Cancel"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(row.id)}
                                                            className="text-sm bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition flex items-center justify-center"
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemove(row.id)}
                                                            className="text-sm bg-red-500 text-white p-2 rounded hover:bg-red-600 transition flex items-center justify-center"
                                                            title="Remove"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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