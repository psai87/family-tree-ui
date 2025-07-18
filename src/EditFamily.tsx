import {type ChangeEvent, type JSX, useEffect, useState} from "react";
import type {Person} from "./model/Person.ts";
import type {PersonRowDetail} from "./model/PersonRowDetail.ts";
import {RowState} from "./model/Constants.ts";
import PeopleRelationService from "./service/PeopleRelationService.ts";
import Util from "./model/Util.ts";


function EditFamily(): JSX.Element {
    const util: Util = new Util();
    const peopleRelationService: PeopleRelationService = new PeopleRelationService();
    const [rowPersons, setRowPersons] = useState<Person[]>([])
    const [rowDetails, setRowDetails] = useState<Map<string, PersonRowDetail>>(new Map<string, PersonRowDetail>())
    const [tempRowPersons, setTempRowPersons] = useState<Map<string, Person>>(new Map<string, Person>())

    useEffect(() => {
        peopleRelationService.getPersons()
            .then(response => {
                setRowPersons(response[0])
                setRowDetails(response[1])
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
            yearOfDeath: -1,
            image: "",
        };
        const newPersonRowDetail: PersonRowDetail = {
            editable: false,
            state: RowState.Added
        }
        setRowPersons([...rowPersons, newPerson]);
        setRowDetails(prevMap => new Map(prevMap).set(newPerson.id, newPersonRowDetail));
    };

    const handleSaveAll = (): void => {
        console.log("Saving data");
        peopleRelationService.savePersons(rowPersons, rowDetails)
            .then(_ => {
                peopleRelationService.getPersons()
                    .then(response => {
                        setRowPersons(response[0])
                        setRowDetails(response[1])
                    })
                    .catch(error => console.log(error))
            })
            .catch(reason => {
                console.log(reason)
            })
            .finally(() => console.log("Data saved"));
    };

    const handleEdit = (id: string): void => {
        setRowDetails(prevMap =>
            new Map(prevMap).set(id, {...prevMap.get(id) as PersonRowDetail, editable: true}));
        setTempRowPersons(prevMap =>
            new Map(prevMap).set(id, rowPersons.find(data => data.id === id) as Person));
    };

    const handleCancel = (id: string): void => {
        setRowDetails(prevMap =>
            new Map(prevMap).set(id, {...prevMap.get(id) as PersonRowDetail, editable: false}));
        setRowPersons(prevMap => prevMap.filter(person => person.id !== id)
            .concat(tempRowPersons.get(id) as Person));
        setTempRowPersons(prevMap => {
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
                newMap.set(id, {...newMap.get(id) as PersonRowDetail, state: RowState.Deleted});
            }
            return newMap;
        })
        setRowPersons(prevMap => prevMap.filter(person => person.id !== id))
        setTempRowPersons(prevMap => {
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
        setRowPersons((prev) =>
            prev.map((row: Person) =>
                row.id === id ? {...row, [field]: value} : row
            ));
    }

    const handleFileInputChange = (
        id: string,
        field: string,
        value: FileList | null
    ): void => {
        getFileBytes(value).then(response => {
            setRowPersons((prev) =>
                prev.map((row: Person) =>
                    row.id === id ? {...row, [field]: response} : row
                ));
        })
    }

    async function getFileBytes(value: FileList | null): Promise<string> {
        const bytes = await value?.item(0)?.arrayBuffer();
        return bytes ? util.arrayBufferToBase64(bytes) : "";
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
        setTempRowPersons(prevMap => {
            const newMap = new Map(prevMap);
            newMap.delete(id)
            return newMap;
        })
    };

    return (
        <>
            <div className="h-screen bg-neutral-100 py-6 px-6 md:px-1">
                <div
                    className="max-w-full mx-auto bg-white shadow-xl rounded-xl border border-neutral-200 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 shrink-0 px-6 py-2">
                        <h2 className="text-xl font-semibold text-gray-800">Editable Records</h2>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-auto px-6">
                        <table className="min-w-full border-separate border-spacing-y-2">
                            <thead className="sticky top-0 bg-white/95 backdrop-blur shadow-sm z-10">
                            <tr className="text-left text-lg text-gray-600">
                                <th className="px-4 py-2">First Name</th>
                                <th className="px-4 py-2">Last Name</th>
                                <th className="px-4 py-2">Occupation</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">YOB</th>
                                <th className="px-4 py-2">YOD</th>
                                <th className="px-4 py-2">Image</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rowPersons.map((row: Person) => (
                                <tr
                                    key={row.id}
                                    className="bg-neutral-50 hover:bg-neutral-100 transition rounded-lg shadow-sm"
                                >
                                    <td className="px-4 py-2">
                                        {rowDetails.get(row.id)?.editable ? (
                                            <input
                                                type="text"
                                                value={row.firstName}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    handleInputChange(row.id, "firstName", e.target.value)
                                                }
                                                className="w-full border border-gray-300 px-3 py-1 rounded-md focus:ring-2 focus:ring-blue-300"
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
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    handleInputChange(row.id, "lastName", e.target.value)
                                                }
                                                className="w-full border border-gray-300 px-3 py-1 rounded-md focus:ring-2 focus:ring-blue-300"
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
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    handleInputChange(row.id, "occupation", e.target.value)
                                                }
                                                className="w-full border border-gray-300 px-3 py-1 rounded-md focus:ring-2 focus:ring-blue-300"
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
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    handleInputChange(row.id, "email", e.target.value)
                                                }
                                                className="w-full border border-gray-300 px-3 py-1 rounded-md focus:ring-2 focus:ring-blue-300"
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
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    handleInputChange(row.id, "yearOfBirth", e.target.value)
                                                }
                                                className="w-full border border-gray-300 px-3 py-1 rounded-md focus:ring-2 focus:ring-blue-300"
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
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    handleInputChange(row.id, "yearOfDeath", e.target.value)
                                                }
                                                className="w-full border border-gray-300 px-3 py-1 rounded-md focus:ring-2 focus:ring-blue-300"
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
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    handleFileInputChange(row.id, "image", e.target.files)
                                                }
                                                className="w-25 border border-gray-300 px-3 py-1 rounded-md focus:ring-2 focus:ring-blue-300"
                                            />
                                        ) : (
                                            <div
                                                className="text-xs rounded-full w-11 h-11 flex justify-center items-center bg-gray-100">
                                                <img
                                                    src={URL.createObjectURL(new Blob([util.base64ToArrayBuffer(row.image)], {type: "image/jpeg"}))}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded border border-gray-400 shadow-sm"
                                                />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {rowDetails.get(row.id)?.editable ? (
                                            <div className="inline-flex gap-2">
                                                <button
                                                    onClick={() => handleSaveRow(row.id)}
                                                    className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                                                >
                                                    ✅ Save
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(row.id)}
                                                    className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                                                >
                                                    ❌ Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="inline-flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(row.id)}
                                                    className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(row.id)}
                                                    className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                                                >
                                                    ❌ Remove
                                                </button>
                                            </div>
                                        )}
                                    </td>

                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end gap-3 mt-4 py-3 px-3">
                        <button
                            onClick={handleAddRow}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm transition"
                        >
                            ➕ Add Record
                        </button>
                        <button
                            onClick={handleSaveAll}
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 shadow-sm transition"
                        >
                            💾 Save All
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

export default EditFamily