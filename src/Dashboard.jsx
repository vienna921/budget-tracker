function Dashboard({ totalIncome, totalExpenses, balance }) {
    return (
        <div>
            <div>
                <h3>Balance</h3>
                <p>${balance.toFixed(2)}</p>
            </div>

            <div>
                <h3>Income</h3>
                <p>${totalIncome.toFixed(2)}</p>
            </div>

            <div>
                <h3>Expenses</h3>
                <p>${totalExpenses.toFixed(2)}</p>
            </div>
        </div>
    )
}

export default Dashboard