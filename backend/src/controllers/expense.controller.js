import Expense from "../models/expense.model.js";

// Create new expense
export const createExpense = async (req, res) => {
  try {
    const {
      description,
      amount,
      category,
      paymentMethod,
      date,
      receipt,
      notes,
    } = req.body;

    // Validate required fields
    if (!description || !amount || !category || !paymentMethod) {
      return res.status(400).json({
        error: "Description, amount, category, and payment method are required.",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: "Amount must be greater than 0.",
      });
    }

    const expense = new Expense({
      description: description.trim(),
      amount: Number(amount),
      category,
      paymentMethod,
      date: date || new Date(),
      receipt,
      createdBy: req.user._id,
    });

    await expense.save();

    res.status(201).json({ expense });
  } catch (err) {
    console.error("Create expense error:", err);
    res.status(500).json({ error: "Failed to create expense." });
  }
};

// Get all expenses with optional filters
export const getExpenses = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      category,
      paymentMethod,
      minAmount,
      maxAmount,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filter = {};

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Category filter
    if (category && category !== "all") {
      filter.category = category;
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== "all") {
      filter.paymentMethod = paymentMethod;
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get expenses with pagination
    const expenses = await Expense.find(filter)
      .populate("createdBy", "name email")
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Expense.countDocuments(filter);

    res.status(200).json({
      expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("Get expenses error:", err);
    res.status(500).json({ error: "Failed to fetch expenses." });
  }
};

// Get expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id).populate("createdBy", "name email");

    if (!expense) {
      return res.status(404).json({ error: "Expense not found." });
    }

    res.status(200).json({ expense });
  } catch (err) {
    console.error("Get expense by ID error:", err);
    res.status(500).json({ error: "Failed to fetch expense." });
  }
};

// Update expense
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      amount,
      category,
      paymentMethod,
      date,
      receipt,
      notes,
    } = req.body;

    // Validate required fields
    if (!description || !amount || !category || !paymentMethod) {
      return res.status(400).json({
        error: "Description, amount, category, and payment method are required.",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: "Amount must be greater than 0.",
      });
    }

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found." });
    }

    // Update expense fields
    expense.description = description.trim();
    expense.amount = Number(amount);
    expense.category = category;
    expense.paymentMethod = paymentMethod;
    expense.date = date || expense.date;
    expense.receipt = receipt !== undefined ? receipt : expense.receipt;

    await expense.save();

    res.status(200).json({ expense });
  } catch (err) {
    console.error("Update expense error:", err);
    res.status(500).json({ error: "Failed to update expense." });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found." });
    }

    await Expense.findByIdAndDelete(id);

    res.status(200).json({ message: "Expense deleted successfully." });
  } catch (err) {
    console.error("Delete expense error:", err);
    res.status(500).json({ error: "Failed to delete expense." });
  }
};

// Get expense statistics
export const getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // Get total expenses
    const totalExpenses = await Expense.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    // Get expenses by category
    const expensesByCategory = await Expense.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Get expenses by payment method
    const expensesByPaymentMethod = await Expense.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$paymentMethod", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Get monthly expenses for the current year
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
            $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Fill missing months
    const filledMonthlyExpenses = [];
    for (let m = 1; m <= 12; m++) {
      const existing = monthlyExpenses.find((item) => item._id.month === m);
      filledMonthlyExpenses.push({
        month: m,
        total: existing ? existing.total : 0,
        count: existing ? existing.count : 0,
      });
    }

    res.status(200).json({
      totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
      expensesByCategory,
      expensesByPaymentMethod,
      monthlyExpenses: filledMonthlyExpenses,
    });
  } catch (err) {
    console.error("Get expense stats error:", err);
    res.status(500).json({ error: "Failed to fetch expense statistics." });
  }
};
