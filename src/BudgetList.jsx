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
                            && transaction.category?.toLowerCase() === budget.category.toLowerCase()
                            && transaction.date
                            && transaction.date.startsWith(budget.month)
                        )
                    })
                    
                    const spent = budgetExpenses.reduce((total, transaction) => {
                        return total + transaction.amount
                    }, 0)
                    
                    const remaining = budget.amount - spent
                    const percentage = (spent / budget.amount) * 100
                    
                    let warning = ""
                    let progressClass = ""
                    if (percentage >= 100) {
                        warning = "You've gone over your budget!"
                        progressClass = "over-budget"
                    } else if (percentage >= 90) {
                        warning = "You've almost reached your budget!"
                        progressClass = "almost-budget"
                    } else if (percentage >= 75) {
                        warning = "You're getting close to your budget."
                        progressClass = "warning-budget"
                    }

                    return (
                        <div className= "budget-row" key={budget.id}>
                            <p>{budget.category}</p>
                            <p>{budget.amount.toFixed(2)}</p>
                            <p>${spent.toFixed(2)}</p>
                            <p>${remaining.toFixed(2)}</p>
                            <div className="budget-progress-container">
                                <p>({percentage.toFixed(0)}% spent)</p>

                                <div className="budget-progress">
                                    <div 
                                        className={`budget-progress-bar ${progressClass}`}
                                        style={{ width: `${Math.min(percentage, 100)}%`}}
                                    ></div>
                                </div>

                                {warning && <p>{warning}</p>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default BudgetList