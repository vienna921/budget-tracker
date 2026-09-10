import TransactionItem from "./TransactionItem"
import EditTransactionForm from "./EditTransactionForm"

function TransactionList({
    transactions,
    filter,
    search,
    selectedMonth,
    onSearchChange,
    onMonthChange,
    onFilterChange,
    months,
    editingId,
    onEdit,
    onDelete,
    onSaveEdit,
    onCancelEdit
}) {
    return (
        <div>
            <h2>Transactions</h2>

            <input
                className="search-input"
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
            />

            <select
                value={selectedMonth}
                onChange={(event) => onMonthChange(event.target.value)}
            >
                <option value="">All months</option>
                {months.map((month) => (
                    <option key={month} value={month}>
                        {new Date(month + "-01T00:00:00").toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric"
                        })}
                    </option>
                ))}
            </select>

            <div className="filter-buttons">
                <button
                    className={filter === "all" ? "active-filter" : ""}
                    onClick={() => onFilterChange("all")}>
                    All
                </button>

                <button
                    className={filter === "income" ? "active-filter" : ""}
                    onClick={() => onFilterChange("income")}>
                    Income
                </button>

                <button
                    className={filter === "expense" ? "active-filter" : ""}
                    onClick={() => onFilterChange("expense")}>
                    Expenses
                </button>
            </div>
            {transactions
                .filter((transaction) => {
                    return (
                        (filter === "all" || transaction.type === filter)
                        && (transaction.category.toLowerCase().includes(search.toLowerCase())
                            || transaction.description.toLowerCase().includes(search.toLowerCase()))
                        && (selectedMonth === "" || (transaction.date && transaction.date.startsWith(selectedMonth)))
                    )
                })
                .map((transaction) => (
                    <div key={transaction.id}>
                        {editingId === transaction.id ? (
                            <EditTransactionForm
                                transaction={transaction}
                                onSave={onSaveEdit}
                                onCancel={onCancelEdit}
                            />
                        ) : (
                            <TransactionItem
                                transaction={transaction}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        )}
                    </div>
                ))
            }
        </div>
    )
}

export default TransactionList