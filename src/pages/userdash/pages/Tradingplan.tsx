import { useState } from "react";
import { useTheme } from "../../../Context/ThemeContext";

const TradingPlan = () => {
  const { theme } = useTheme();

  const [purpose, setPurpose] = useState(
    localStorage.getItem("purpose") ||
      "Example : I am trading to have a retirement nest egg and quit my 9 to 5, so I can work for myself. Making me money not someone else. I want to replace my job income, so I can have the freedom of my own hours and spending as much time with my family as possible."
  );
  const [isEditingPurpose, setIsEditingPurpose] = useState(false);
  const [isEditingExpenses, setIsEditingExpenses] = useState(false);
  const [name, setName] = useState(
    localStorage.getItem("name") || "Put name here"
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [livingExpenses, setLivingExpenses] = useState(
    localStorage.getItem("livingExpenses") || "$4,000"
  );

  const [monthlyLivingExpenses, setMonthlyLivingExpenses] = useState(
    localStorage.getItem("monthlyLivingExpenses") || "$7,500"
  );
  const [isEditingMonthlyExpenses, setIsEditingMonthlyExpenses] =
    useState(false);

  const [percentage, setPercentage] = useState(
    localStorage.getItem("percentage") || "20%"
  );
  const [isEditingPercentage, setIsEditingPercentage] = useState(false);

  const livingExpenses6 = `$${(
    parseFloat(livingExpenses.replace(/[^0-9.-]+/g, "")) * 6
  ).toLocaleString()}`;

  const livingExpenses12 = `$${(
    parseFloat(livingExpenses.replace(/[^0-9.-]+/g, "")) * 12
  ).toLocaleString()}`;

  const updatePurpose = () => {
    localStorage.setItem("purpose", purpose);
  };

  const updateLivingExpenses = () => {
    localStorage.setItem("livingExpenses", livingExpenses);
  };
  const updateMonthlyLivingExpenses = () => {
    localStorage.setItem("monthlyLivingExpenses", monthlyLivingExpenses);
  };

  const updatePercentage = () => {
    localStorage.setItem("percentage", percentage);
  };

  const updateName = () => {
    localStorage.setItem("name", name);
  };

  const tradingAccountForExpenses = `$${(
    parseFloat(livingExpenses.replace(/[^0-9.-]+/g, "")) /
    (parseFloat(percentage.replace(/[^0-9.-]+/g, "")) / 100)
  ).toLocaleString()}`;

  const tradingAccountForIncome = `$${(
    parseFloat(monthlyLivingExpenses.replace(/[^0-9.-]+/g, "")) /
    (parseFloat(percentage.replace(/[^0-9.-]+/g, "")) / 100)
  ).toLocaleString()}`;

  return (
    <div
      className={`${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      } p-12 min-h-screen mx-48`}
    >
      <h1 className="text-3xl font-bold mb-6">Trading Plan</h1>

      {/*Purpose */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">My Purpose</h2>
        <p
          className={`${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          } mb-4`}
        >
          (Why are you trading? Why do you want to trade? What is your main
          driver? What do you need money for? Do you want to support your
          current income or completely replace it?)
        </p>
        {isEditingPurpose ? (
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)} // Update state as the user types
            onBlur={() => {
              setIsEditingPurpose(false); // Exit edit mode
              updatePurpose(); // Save to local storage
            }}
            className="w-full bg-transparent border border-indigo-300 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            autoFocus
          />
        ) : (
          <p
            onClick={() => setIsEditingPurpose(true)} // Enter edit mode
            className={`${
              theme === "dark" ? "white" : "black"
            } mb-4 cursor-pointer hover:border hover:border-indigo-300 hover:rounded px-2 py-1`}
          >
            {purpose}
          </p>
        )}
      </section>

      {/* Financial Situation */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          Current Financial Situation
        </h2>
        <p className={`${theme === "dark" ? "text-white" : "text-black"}`}>
          My Monthly Living Expenses (LE) are:{" "}
          {isEditingExpenses ? (
            <input
              type="text"
              value={livingExpenses}
              onChange={(e) => setLivingExpenses(e.target.value)} // Update state as the user types
              onBlur={() => {
                setIsEditingExpenses(false); // Exit edit mode
                updateLivingExpenses(); // Save to local storage
              }}
              className="bg-transparent border border-indigo-300 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              autoFocus
            />
          ) : (
            <span
              onClick={() => setIsEditingExpenses(true)} // Enter edit mode
              className="cursor-pointer hover:border hover:border-indigo-300 hover:rounded px-2 py-1"
            >
              {livingExpenses}
            </span>
          )}
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          My Total Avg. Monthly Income (MI) is:{" "}
          {isEditingMonthlyExpenses ? (
            <input
              type="text"
              value={monthlyLivingExpenses}
              onChange={(e) => setMonthlyLivingExpenses(e.target.value)} // Update state as the user types
              onBlur={() => {
                setIsEditingMonthlyExpenses(false); // Exit edit mode
                updateMonthlyLivingExpenses(); // Save to local storage
              }}
              className="bg-transparent border border-indigo-300 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
              autoFocus
            />
          ) : (
            <span
              onClick={() => setIsEditingMonthlyExpenses(true)} // Enter edit mode
              className="cursor-pointer hover:border hover:border-indigo-300 hover:rounded px-2 py-1"
            >
              {monthlyLivingExpenses}
            </span>
          )}
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          Therefore, in order to survive, I need to make a minimum of :
        </p>
        <ul
          className={`list-disc list-inside mb-4 ${
            theme === "dark" ? "text-white" : "text-black"
          }`}
        >
          <li>{livingExpenses} per month.</li>
          <li>{livingExpenses6} for 6 months.</li>
          <li>{livingExpenses12} for 12 months.</li>
        </ul>
      </section>

      {/* Money Plan */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">My Money Plan</h2>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          Based on my Backtesting/Live Performance, I can easily generate{" "}
          {isEditingPercentage ? (
            <input
              type="text"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)} // Update state as the user types
              onBlur={() => {
                setIsEditingPercentage(false); // Exit edit mode
                updatePercentage(); // Save to local storage
              }}
              className={`${
                theme === "dark" ? "text-white" : "text-black"
              } bg-transparent border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
              autoFocus
            />
          ) : (
            <span
              onClick={() => setIsEditingPercentage(true)} // Enter edit mode
              className="cursor-pointer hover:border hover:border-indigo-300 hover:rounded px-2 py-1"
            >
              {percentage}
            </span>
          )}{" "}
          per month.
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          To cover my monthly expenses, I need a {tradingAccountForExpenses}{" "}
          Trading Account to start with.
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-green-600"} mb-4`}>
          ( {tradingAccountForExpenses} = {livingExpenses} (LE) / {percentage}{" "}
          (percentage per month) )
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          To look at replacing my job, I need a {tradingAccountForIncome}{" "}
          Trading Account to start with.
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-green-600"} mb-4`}>
          ( {tradingAccountForIncome} = {monthlyLivingExpenses} (MI) /{" "}
          {percentage} (percentage per month) )
        </p>
      </section>

      {/* Risk Parameters */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Risk Parameters</h2>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>I will be risking 5% per trade.</p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>My Max Loss per Day is 5%.</p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          That is 1 Losing Trade per day @ 5% risk per trade.
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          or 2 losing trades per day @ 2.5% risk per trade
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          My Max Loss per Week is 25% which is 5% per day.
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          Max trades per day is 2 trades, but only if first trade is a winner
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>Profit Target:</p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          R/R (Risk to reward) 5:1, so risk of 5% gives reward of 25% which on a
          $500 account would be $25. 5 winning trades would be 100% monthly
          profit, so $500 becomes $1000
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>Monthly Profit Target of 100%</p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          If my balance falls below 50%, I will reduce my risk to 2% per trade.
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          I will trade with the reduced risk only if I am below my drawdown
          threshold.
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          If my balance has increased by 600%, I will increase my risk to 10%
          per trade.
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          I will trade with the increased risk as long as I am in profit.
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>I target 25% per week.</p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>I’d love to achieve 200% per month.</p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>My current Win Rate is 80%.</p>
      </section>

      {/* Trading Symbols */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Trading Symbols</h2>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          My Trading Windows are between 9am to 5pm.
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>My Trading Pairs are:</p>
        <ul className={`${theme === "dark" ? "text-white" : "text-black"} list-disc list-inside mb-4`}>
          <li>USD/CAD</li>
          <li>GOLD</li>
          <li>SILVER</li>
          <li>BITCOIN</li>
        </ul>
      </section>

      {/* Final Commitment */}
      <section className="mb-8">
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          I commit to following this plan strictly. It is my full responsibility
          to manage my risk and execute on my trading system flawlessly, without
          being influenced by emotions.
        </p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>Sign:</p>
        <p className={`${theme === "dark" ? "text-white" : "text-black"} mb-4`}>
          {isEditingName ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                setIsEditingName(false);
                updateName();
              }}
              className={`${theme === "dark" ? "text-white" : "text-black"} bg-transparent border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-300`}
              autoFocus
            />
          ) : (
            <p
              onClick={() => setIsEditingName(true)}
              className={`${theme === "dark" ? "text-white" : "text-black"} mb-4 cursor-pointer hover:border hover:border-indigo-300 hover:rounded px-2 py-1`}
            >
              {name}
            </p>
          )}
        </p>
      </section>
    </div>
  );
};

export default TradingPlan;
