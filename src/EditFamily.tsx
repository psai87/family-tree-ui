import {type ChangeEvent, useState} from "react";

function EditFamily() {
    const [rows, setRows] = useState<RowData[]>([])
    const handleAddRow = () => {
        const newRow: RowData = {
            id: Date.now(),
            name: "",
            email: "",
            age: "",
            isEditing: true,
        };
        setRows([...rows, newRow]);
    };

    const handleSaveAll = () => {
        console.log("Saved data:", rows);
        alert("All data saved to console!");
    };

    const handleEdit = (id: number) => {
        setRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, isEditing: true } : row))
        );
    };

    const handleSaveRow = (id: number) => {
        setRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, isEditing: false } : row))
        );
    };

    const handleInputChange = (
        id: number,
        field: keyof Omit<RowData, "id" | "isEditing">,
        value: string
    ) => {
        setRows((prev) =>
            prev.map((row) =>
                row.id === id ? { ...row, [field]: value } : row
            )
        );
    };

    return (
        <>
            <div className="min-h-screen bg-neutral-100 py-12 px-6 md:px-12">
                <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl border border-neutral-200 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Editable Records</h2>
                        <div className="flex gap-3">
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

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-y-2">
                            <thead>
                            <tr className="text-left text-sm text-gray-600">
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Email</th>
                                <th className="px-4 py-2">Age</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="bg-neutral-50 hover:bg-neutral-100 transition rounded-lg shadow-sm"
                                >
                                    <td className="px-4 py-2">
                                        {row.isEditing ? (
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
                                        {row.isEditing ? (
                                            <input
                                                type="email"
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
                                        {row.isEditing ? (
                                            <input
                                                type="number"
                                                value={row.age}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    handleInputChange(row.id, "age", e.target.value)
                                                }
                                                className="w-full border border-gray-300 px-3 py-1 rounded-md focus:ring-2 focus:ring-blue-300"
                                            />
                                        ) : (
                                            <span>{row.age}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row.isEditing ? (
                                            <button
                                                onClick={() => handleSaveRow(row.id)}
                                                className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                                            >
                                                ✅ Save
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(row.id)}
                                                className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                                            >
                                                ✏️ Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditFamily

// Type for each table row
export interface RowData {
    id: number;
    name: string;
    email: string;
    age: string;
    isEditing: boolean;
}