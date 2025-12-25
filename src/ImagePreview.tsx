import { useEffect, useState } from "react";

function ImagePreview({ buffer, yearOfDeath }: { buffer: ArrayBuffer | undefined, yearOfDeath: number }) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!buffer || buffer.byteLength === 0) {
            setUrl(null);
            return
        }

        const blob = new Blob([buffer], { type: "image/jpeg" });
        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);

        return () => {
            setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
        };
    }, [buffer]);

    if (!url) return null;

    return (
        <img
            src={url}
            alt="Preview"
            className={yearOfDeath == -1 ? "w-full h-full object-cover rounded border border-gray-400 shadow-sm" : "w-full h-full object-cover rounded border-3 border-rose-900 shadow-sm"}
        />
    );
}

export default ImagePreview;