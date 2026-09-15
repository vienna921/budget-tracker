import ReceiptScanner from "../components/ReceiptScanner";

function ReceiptPage({ onSubmit, onError }) {
    return (
        <div className="page">
            <h1>Scan Receipt</h1>

            <ReceiptScanner
                onSubmit={onSubmit}
                onError={onError}
            />
        </div>
    )
}

export default ReceiptPage