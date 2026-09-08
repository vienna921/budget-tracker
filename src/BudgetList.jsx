function BudgetList({ budgets, transactions }) {
    return (
        <div className="budget-list">
            <h2>Your Budgets</h2>

            <div className="budget-table">
                <div className="budget-header">
                    <p>Category</p>
                    <p>Budget</p>
                    <p>Spent</p>
                    <p>Remaining</p>
            </div>
            
                {budgets.map((budget) => {
                    const budgetExpenses = transactions.filter((transaction) => {
                        return (
                            transaction.type === "expense"
                            && transaction.category.toLowerCase() === budget.category.toLowerCase()
                            && transaction.date
                            && transaction.date.startsWith(budget.month)
                        )
                    })
                    
                    const spent = budgetExpenses.reduce((total, transaction) => {
                        return total + transaction.amount
                    }, 0)

                    const remaining = budget.amount - spent

                    return (
                        <div className= "budget-row" key={budget.id}>
                            <p>{budget.category}</p>
                            <p>{budget.amount.toFixed(2)}</p>
                            <p>${spent.toFixed(2)}</p>
                            <p>${remaining.toFixed(2)}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default BudgetList