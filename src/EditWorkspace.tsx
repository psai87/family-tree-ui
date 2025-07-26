import {type ChangeEvent, type JSX, useEffect, useState} from "react";
import type {PersonRowDetail} from "./model/PersonRowDetail.ts";
import {RowState} from "./model/Constants.ts";
import PeopleRelationService from "./service/PeopleRelationService.ts";
import type {Workspace} from "./model/Workspace.ts";
import type {AlertsProps} from "./model/Props.ts";

function EditWorkspace({setAlerts}: AlertsProps): JSX.Element {

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
            .catch(error => console.log(error))
    }, []);


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
                    .catch(error => console.log(error))
                setAlerts(prevState => [...prevState, {
                    id: Date.now(),
                    type: "success",
                    message: "Saved successfully",
                }])
            })
            .catch(reason => {
                console.log(reason)
                setAlerts(prevState => [...prevState, {
                    id: Date.now(),
                    type: "error",
                    message: reason.message
                }])
            });
    };

    const handleEdit = (id: string): void => {
        setRowDetails(prevMap =>
            new Map(prevMap).set(id, {...prevMap.get(id) as PersonRowDetail, editable: true}));
        setTempRowWorkspaces(prevMap =>
            new Map(prevMap).set(id, rowWorkspaces.find(data => data.id === id) as Workspace));
    };

    const handleCancel = (id: string): void => {
        setRowDetails(prevMap =>
            new Map(prevMap).set(id, {...prevMap.get(id) as PersonRowDetail, editable: false}));
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
                newMap.set(id, {...newMap.get(id) as PersonRowDetail, state: RowState.Deleted});
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
                row.id === id ? {...row, [field]: value} : row
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
                                <th className="px-4 py-2">Name</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rowWorkspaces.map((row: Workspace) => (
                                <tr
                                    key={row.id}
                                    className="bg-neutral-50 hover:bg-neutral-100 transition rounded-lg shadow-sm"
                                >
                                    <td className="px-4 py-2">
                                        {rowDetails.get(row.id)?.editable ? (
                                            <input
                                                type="text"
                                                value={row.name}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    handleInputChange(row.id, "name", e.target.value)
                                                }
                                                className="w-full border border-gray-300 px-3 py-1 rounded-md focus:ring-2 focus:ring-blue-300"
                                            />
                                        ) : (
                                            <span>{row.name}</span>
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

export default EditWorkspace