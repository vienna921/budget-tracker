import { useState } from "react"

function ReceiptScanner() {
    const [file, setFile] = useState(null)
    const [text, setText] = useState("")
    const [scanning, setScanning] = useState(false)
    const [receiptData, setReceiptData] = useState(null)

    function handleFileChange(event) {
        setFile(event.target.files[0])
    }

    async function scanReceipt() {
        if (!file) return

        setScanning(true)

        try {
            const formData = new FormData()

            formData.append("receipt", file)

            const response = await fetch(
                "http://localhost:3000/api/scan-receipt",
                {
                    method: "POST",
                    body: formData
                }
            )

                const data = await response.json()

                setReceiptData(data)
                
        } catch (error) {
            console.error("OCR ERROR:", error)
        } finally {
            setScanning(false)
        }
    }

    function extractAmount(text) {
        // look for clear TOTAL first
        const totalMatch = text.match(/\bTOTAL\b[^0-9]*\$?(\d+\.\d{2})/i)

        if (totalMatch) {
            return totalMatch[1]
        }

        // fallback: find all dollar amounts
        const amounts = text.match(
            /\$?\d+\.\d{2}/g
        )

        if (amounts) {
            const numbers = amounts.map(amount =>
                parseFloat(amount.replace("$", ""))
            )
            return Math.max(...numbers).toFixed(2)
        }

        return ""
    }

    return (
        <div>
            <h2>Scan Receipt</h2>
            <p>Upload a receipt to automatically create a transaction.</p>
            <div className="receipt-options">
                <label className="receipt-button">
                    Take Photo
                    <input 
                        type="file" 
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                    />
                </label>
                <label className="receipt-button">
                    Upload Photo
                    <input
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </label>
            </div>
           

            {file && <p>Selected: {file.name}</p>}

            <button onClick={scanReceipt}>
                Scan Receipt
            </button>

            {text && <pre>{text}</pre>}

            {receiptData && (
                <div>
                    <p>Merchant: {receiptData.merchant}</p>
                    <p>Amount: ${receiptData.amount}</p>
                    <p>Date: {receiptData.date}</p>
                </div>
            )}
        </div>
    )
}

export default ReceiptScanner