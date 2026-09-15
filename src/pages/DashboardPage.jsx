import Dashboard from "../components/Dashboard"
import MonthlySummary from "../components/MonthlySummary"

function DashboardPage({ totalIncome, totalExpenses, balance, transactions, selectedMonth}) {
    return (
        <div className="page">
            <h1>Dashboard</h1>

            <Dashboard
                totalIncome={totalIncome}
                totalExpenses={totalExpenses}
                balance={balance}
                transactions={transactions}
            />

            <MonthlySummary
                transactions={transactions}
                selectedMonth={selectedMonth}
            />
        </div>
    )
}

export default DashboardPage