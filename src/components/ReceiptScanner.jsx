const API_URL = import.meta.env.VITE_API_URL
import { useState } from "react"

function ReceiptScanner({ onSubmit, onError }) {
    const [file, setFile] = useState(null)
    const [scanning, setScanning] = useState(false)
    const [receiptData, setReceiptData] = useState(null)
    const [saveMessage, setSaveMessage] = useState("")

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
                `${API_URL}/api/scan-receipt`,
                {
                    method: "POST",
                    body: formData
                }
            )   

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || "Could not scan receipt")
                }

                const data = await response.json()
                if (!data.merchang && !data.amount) {
                    throw new Error("Could not read receipt. Please try a clearer photo.")
                }
                setReceiptData({
                    ...data, 
                    category: data.category || "Default Category",
                    date: data.date || new Date().toISOString().split("T")[0]
                })
                
        } catch (error) {
            console.error("OCR ERROR:", error)
            onError("Could not scan receipt. Please try again.")
        } finally {
            setScanning(false)
        }
    }

    async function saveTransaction() {
        if (!receiptData) return
        if (
            !receiptData.merchant.trim() ||
            !receiptData.amount ||
            !receiptData.category.trim() ||
            !receiptData.date
        )  {
            alert("Please fill in all fields")
            return
        }

        try {

            console.log("SENDING:", {
                amount: Number(receiptData.amount),
                category: receiptData.category,
                merchant: receiptData.merchant,
                date: receiptData.date
            })

            console.log("COOKIES:", document.cookie)

            const newTransaction = await onSubmit({
                type: "expense",
                amount: Number(receiptData.amount),
                category: receiptData.category,
                description: receiptData.merchant,
                date: receiptData.date
            })
           
            console.log("SAVED TRANSACTION:", newTransaction)
            setSaveMessage("Transaction saved!")
            setReceiptData(null)
            setFile(null)

        } catch (error) {
            console.error("SAVED ERROR:", error)
            onError(error.message)
            setSaveMessage("")
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
                <div className="receipt-review">
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
                            value={receiptData.category} 
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
            {saveMessage && <p>{saveMessage}</p>}
        </div>
    )
}

export default ReceiptScanner