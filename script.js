// Elements
const form = document.getElementById('entry-form');
const descInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categorySelect = document.getElementById('category');

const errorDesc = document.getElementById('error-desc');
const errorAmount = document.getElementById('error-amount');
const errorCategory = document.getElementById('error-category');

const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income-total');
const expenseEl = document.getElementById('expense-total');
const transactionsList = document.getElementById('transactions-list');
const filterCategory = document.getElementById('filter-category');

let transactions = [];

// Load transactions from localStorage
function loadTransactions() {
  const data = localStorage.getItem('transactions');
  if (data) {
    try {
      transactions = JSON.parse(data).map(t => ({ ...t, amount: Number(t.amount) }));
    } catch {
      transactions = [];
    }
  }
}

// Save transactions to localStorage
function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Format currency
function formatCurrency(num) {
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

// Update totals display
function updateTotals() {
  const income = transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0);

  incomeEl.textContent = formatCurrency(income);
  expenseEl.textContent = formatCurrency(Math.abs(expense));
  balanceEl.textContent = formatCurrency(income + expense);
}

// Render transactions list with optional filtering
function renderTransactions() {
  const filter = filterCategory.value;
  transactionsList.innerHTML = '';

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.category === filter);

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No transactions found.';
    li.style.textAlign = 'center';
    li.style.color = '#666';
    transactionsList.appendChild(li);
    return;
  }

  filtered.forEach(({ id, description, amount, category }) => {
    const li = document.createElement('li');
    li.classList.add(amount > 0 ? 'income' : 'expense');

    const descSpan = document.createElement('span');
    descSpan.className = 'transaction-desc';
    descSpan.textContent = `${description} [${category}]`;

    const amountSpan = document.createElement('span');
    amountSpan.className = 'transaction-amount';
    amountSpan.textContent = formatCurrency(amount);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.title = 'Delete transaction';
    deleteBtn.addEventListener('click', () => {
      transactions = transactions.filter(t => t.id !== id);
      saveTransactions();
      updateTotals();
      renderTransactions();
    });

    li.appendChild(descSpan);
    li.appendChild(amountSpan);
    li.appendChild(deleteBtn);

    transactionsList.appendChild(li);
  });
}

// Validate inputs and show errors
function validateInputs(desc, amount, category) {
  let valid = true;
  errorDesc.textContent = '';
  errorAmount.textContent = '';
  errorCategory.textContent = '';

  if (!desc.trim()) {
    errorDesc.textContent = 'Description is required.';
    valid = false;
  }
  if (isNaN(amount) || amount === 0) {
    errorAmount.textContent = 'Amount must be a non-zero number.';
    valid = false;
  }
  if (!category) {
    errorCategory.textContent = 'Please select a category.';
    valid = false;
  }
  return valid;
}

// Generate unique ID
function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Form submit handler
form.addEventListener('submit', e => {
  e.preventDefault();

  const description = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;

  if (!validateInputs(description, amount, category)) return;

  const transaction = { id: generateId(), description, amount, category };

  transactions.push(transaction);
  saveTransactions();
  updateTotals();
  renderTransactions();

  form.reset();
});

// Filter change handler
filterCategory.addEventListener('change', () => {
  renderTransactions();
});

// Initialize
loadTransactions();
updateTotals();
renderTransactions();
