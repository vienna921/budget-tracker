import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";

function TransactionsPage({
    onSubmit,
    onError,
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
        <div className="page">
            <h1>Transactions</h1>
            <TransactionForm
                onSubmit={onSubmit}
                onError={onError}
            />
            <TransactionList
                transactions={transactions}
                filter={filter}
                search={search}
                selectedMonth={selectedMonth}
                onSearchChange={onSearchChange}
                onMonthChange={onMonthChange}
                onFilterChange={onFilterChange}
                months={months}
                editingId={editingId}
                onEdit={editingId}
                onDelete={onDelete}
                onSaveEdit={onSaveEdit}
                onCancelEdit={onCancelEdit}
            />
        </div>
    )
}
export default TransactionsPage