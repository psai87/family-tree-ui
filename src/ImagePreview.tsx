import {useEffect, useState} from "react";
import Util from "./model/Util.ts";

function ImagePreview({base64, yearOfDeath}: { base64: string | undefined, yearOfDeath: number }) {
    const util: Util = new Util();
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!base64) return;

        const buffer = util.base64ToArrayBuffer(base64); // 👈 Ensure this returns valid ArrayBuffer
        const blob = new Blob([buffer], {type: "image/jpeg"});
        const objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [base64]);

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