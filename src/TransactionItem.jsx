function TransactionItem({ transaction, onEdit, onDelete }) {
    return (
        <div>
            <p>{transaction.category}</p>
            <p>{transaction.description}</p>
            <p>${transaction.amount}</p>

            <button onClick={() => onEdit(transaction)}>
                Edit
            </button>

            <button onClick={() => onDelete(transaction.id)}>
                Delete
            </button>
        </div>
    )
}

export default TransactionItem