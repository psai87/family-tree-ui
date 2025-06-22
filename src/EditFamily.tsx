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
                <div className="p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
                    {/* Buttons */}
                    <div className="flex justify-end mb-6 gap-4">
                        <button
                            onClick={handleAddRow}
                            className="bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:bg-blue-700 transition duration-300"
                        >
                            ➕ Add Record
                        </button>
                        <button
                            onClick={handleSaveAll}
                            className="bg-green-600 text-white px-5 py-2 rounded-xl shadow hover:bg-green-700 transition duration-300"
                        >
                            💾 Save All
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-auto shadow-2xl rounded-2xl border border-gray-200 bg-white">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100 text-gray-700 text-left">
                            <tr>
                                <th className="py-3 px-6">Name</th>
                                <th className="py-3 px-6">Email</th>
                                <th className="py-3 px-6">Age</th>
                                <th className="py-3 px-6">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="border-t hover:bg-gray-50 transition duration-150"
                                >
                                    <td className="py-3 px-6">
                                        {row.isEditing ? (
                                            <input
                                                type="text"
                                                value={row.name}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    handleInputChange(row.id, "name", e.target.value)
                                                }
                                                className="w-full border border-gray-300 px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            />
                                        ) : (
                                            <span className="text-gray-800">{row.name}</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-6">
                                        {row.isEditing ? (
                                            <input
                                                type="email"
                                                value={row.email}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    handleInputChange(row.id, "email", e.target.value)
                                                }
                                                className="w-full border border-gray-300 px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            />
                                        ) : (
                                            <span className="text-gray-800">{row.email}</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-6">
                                        {row.isEditing ? (
                                            <input
                                                type="number"
                                                value={row.age}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                                    handleInputChange(row.id, "age", e.target.value)
                                                }
                                                className="w-full border border-gray-300 px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            />
                                        ) : (
                                            <span className="text-gray-800">{row.age}</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-6">
                                        {row.isEditing ? (
                                            <button
                                                onClick={() => handleSaveRow(row.id)}
                                                className="bg-green-500 text-white px-4 py-1 rounded-md hover:bg-green-600 transition"
                                            >
                                                ✅ Save
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(row.id)}
                                                className="bg-gray-500 text-white px-4 py-1 rounded-md hover:bg-gray-600 transition"
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