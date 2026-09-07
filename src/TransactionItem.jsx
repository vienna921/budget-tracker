function TransactionItem({ transaction, onEdit, onDelete }) {
    return (
        <div className={`transaction-item ${transaction.type}`}>
            <p className="transaction-category">{transaction.category}</p>
            <p className="transaction-description">{transaction.description}</p>
            <p className="transaction-amount">${transaction.amount.toFixed(2)}</p>
            <p className="transaction-date">
                {transaction.date
                    ? new Date(transaction.date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                })
                : "No date"}
            </p>
            <button 
                className="edit-button"
                onClick={() => onEdit(transaction)}
            >
                Edit
            </button>

            <button 
                className="delete-button"
                onClick={() => onDelete(transaction.id)}
            >
                Delete
            </button>
        </div>
    )
}

export default TransactionItem