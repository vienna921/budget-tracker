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
            
                setReceiptData({
                    ...data, 
                    category: data.category || "Default Category",
                    date: data.date || new Date().toISOString().split("T")[0]
                })
                
        } catch (error) {
            console.error("OCR ERROR:", error)
        } finally {
            setScanning(false)
        }
    }

    async function saveTransaction() {
        if (!receiptData) return
        try {

            console.log("SENDING:", {
                amount: Number(receiptData.amount),
                category: receiptData.category,
                merchant: receiptData.merchant,
                date: receiptData.date
            })

            const response = await fetch(
                "http://localhost:3000/api/transactions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        type: "expense",
                        amount: Number(receiptData.amount),
                        category: receiptData.category,
                        description: receiptData.merchant,
                        date: receiptData.date
                    })
                }
            )
            const data = await response.json()

            console.log("SAVED TRANSACTION:", data)
        } catch (error) {
            console.error("SAVED ERROR:", error)
        }
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

            <button 
                onClick={scanReceipt}
                disabled={!file || scanning}
            >
                {scanning? "Scanning...": "Scan Receipt"}
            </button>

            {receiptData && (
                <div>
                    <label>
                        Merchant:
                        <input 
                            value={receiptData.merchant || ""} 
                            onChange={(event) => 
                                setReceiptData({
                                    ...receiptData,
                                    merchant: event.target.value
                                })
                            }
                        />
                    </label>
                    <label>
                        Amount:
                        <input 
                            value={receiptData.amount || ""} 
                            onChange={(event) => 
                                setReceiptData({
                                    ...receiptData,
                                    amount: event.target.value
                                })
                            }
                        />
                    </label>
                    <label>
                        Date:
                        <input 
                            type="date"
                            value={receiptData.date} 
                            onChange={(event) => 
                                setReceiptData({
                                    ...receiptData,
                                    date: event.target.value
                                })
                            }
                        />
                    </label>
                    <label>
                        Category:
                        <input 
                            value={receiptData.category || "Default Category"} 
                            onChange={(event) => 
                                setReceiptData({
                                    ...receiptData,
                                    category: event.target.value
                                })
                            }
                        />
                    </label>
                    <button onClick={saveTransaction}>
                        Save Transaction
                    </button>
                </div>
            )}

        </div>
    )
}

export default ReceiptScanner