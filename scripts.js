const modal = document.querySelector('.modal-overlay');
const button = document.querySelector('.button-new')
const cancel = document.querySelector('.cancel')

function addModal() {
    modal.classList.toggle('active')
}

button.addEventListener('click', addModal)
cancel.addEventListener('click', addModal)
    // fim do modal


// ========================= TRANSACAO ================================

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}


// CALCULO 
const Transaction = {
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },
    // valores de entrada
    incomes() {
        let income = 0
            // soma todas as entradas maiores que 0
        Transaction.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },
    // valor de saida

    expenses() {
        let expense = 0
            // soma todas as saidas menores que 0
        Transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense

    },
    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

// FORMATACAO DO HTML
const DOM = {

    // pega a tabela geral
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        // cria uma tr nova com o conteudo do innerHTMLTransaction
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        // onde vai adicionar
        DOM.transactionContainer.appendChild(tr)
    },

    // estrutura html que deseja adicionar
    innerHTMLTransaction(transaction, index) {
        // verifica se o valor é positivo e adiciona a classe income ou expense 
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        // utilizando as ´´ voce pode colocar variaveis nas strings
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="remover transação"></td>
            `

        return html
    },


    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())


    },

    clearTransactions() {
        DOM.transactionContainer.innerHTML = ""
    }
}

// FORMATACAO DA MOEDA
const Utils = {
    formatAmount(value) {
        value = Number(value) * 100

        return value
    },

    formatdate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        // adiciona o sinal negativo ou positivo
        const signal = Number(value) < 0 ? "-" : ""
            // tira tudo que nao é numero
        value = String(value).replace(/\D/g, '')
            // divide por 100
        value = Number(value) / 100

        // formata para real
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}


// VALIDACAO DO FORMULARIO
const Form = {
    description: document.querySelector('#description'),
    amount: document.querySelector('#amount'),
    date: document.querySelector('#date'),


    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validadeFields() {
        const { description, amount, date } = Form.getValues()
        if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error("Por favor preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)

        date = Utils.formatdate(date)

        return {
            description,
            amount,
            date
        }

    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },


    submit(event) {
        event.preventDefault()

        try {
            Form.validadeFields()
            const transaction = Form.formatValues()
            Form.saveTransaction(transaction)
            Form.clearFields()
            addModal()
        } catch (error) {
            alert(error.message)
        }

    }
}

const App = {
    init() {

        // adiciona cada objeto do array transactions

        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)

    },
    reload() {
        DOM.clearTransactions()
        App.init()

    }
}

App.init()