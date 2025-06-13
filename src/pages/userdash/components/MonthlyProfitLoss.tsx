import React from 'react'

const MonthlyProfitLoss = () => {
  return (
            <ChartCard title="Monthly Profit/Loss">
              <BarChart width={500} height={300} data={monthlyProfitLossData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#333",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="profit" fill="#8884d8" />
              </BarChart>
            </ChartCard>
  )
}

export default MonthlyProfitLoss