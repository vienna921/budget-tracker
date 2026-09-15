import BudgetForm from "../components/BudgetForm";
import BudgetList from "../components/BudgetList";
import EditBudgetForm from "../components/EditBudgetForm";

function BudgetsPage({
    budgets,
    transactions,
    onDelete,
    onEdit,
    selectedMonth,
    onMonthChange,
    onBudgetAdded,
    editingBudget,
    onSaveBudget
}) {
    return (
        <div className="page">
            <h1>Budgets</h1>

            <BudgetForm
                onBudgetAdded={onBudgetAdded}
            />

            <BudgetList
                budgets={budgets}
                transactions={transactions}
                onDelete={onDelete}
                onEdit={onEdit}
                selectedMonth={selectedMonth}
                onMonthChange={onMonthChange}
            />

            {editingBudget && (
                <EditBudgetForm
                    budget={editingBudget}
                    onSave={onSaveBudget}
                />
            )}
        </div>
    )
}

export default BudgetsPage