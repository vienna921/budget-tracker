import { useState } from "react"

function ReceiptScanner() {
    const [file, setFile] = useState(null)

    function handleFileChange(event) {
        setFile(event.target.files[0])
    }

    return (
        <div>
            <h2>Scan Receipt</h2>
            <p>Upload a receipt to automatically create a transaction.</p>

            <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
            />

            {file && <p>Selected: {file.name}</p>}
        </div>
    )
}

export default ReceiptScanner