const listTopMovies = document.querySelector('.top-list')
const listMovies = document.querySelector('.movies-list')
const cartList = document.querySelector('.cart-items')
const buttonCart = document.querySelector('.cart-button')
const buttonCartTotal = document.querySelector('.cart-button span')

const buttonNext = document.querySelector('.cart-button')


const sidebarContent = document.querySelector('.sidebar .content')
const loading = document.querySelector('.loading');
const inputCode = document.querySelector('#code_coupon')


const form = document.querySelector('#form')

let cart = []
let movies = []
let genresMovies = []
let totalCart = 0

const updateCart = () => {
    cartList.innerHTML = ""
    cartList.innerHTML = cart.map(({ id, title, image, amount, price }) => {

        const minusImage = amount === 1 ? `<img src="images/delete.svg">` : `<img src="images/minus.svg"></img>`
        const priceFinal = (price / 100).toFixed(2).replace(".", ",")

        return `
        <li class="cart-list">
            <div class="cart-thumbnail">
                <img src="${image}" alt="${title}">
            </div>
            <div class="cart-info">
                <div class="cart-title-product">
                    <p>${title}</p>
                </div>
                <div class="cart-price-product">
                    <p>R$ ${priceFinal}</p>
                </div>
            </div>
            <div class="cart-amount">
                <span>
                    <button class="more" onclick="increaseItemAmount(${id})"><img src="images/add.svg"></button>
                    <p data-amount=[${id}] >${amount}</p>
                    <button class="minus" onclick="decreaseItemAmount(${id})">${minusImage}</button>
                </span>
            </div>
        </li>
    `
    }).join("")

    let discount = 0
    if (inputCode.value === "htmlnaoelinguagem") {
        discount = 50
    }

    let priceTotal = cart.reduce((total, { amount, price }) => {
        return amount * price + total
    }, 0)

    priceTotal = priceTotal - (priceTotal / 100 * discount)

    priceTotal = (priceTotal / 100).toFixed(2).replace(".", ",")

    buttonCartTotal.innerText = priceTotal

    saveLocalStorage(cart)

}


const removeMovieCart = (id) => {
    const index = getIndexById(id)
    if (index > -1) {
        cart.splice(index, 1)
    }

    if (cart.length === 0) {
        sidebarContent.style.display = "flex"
        buttonNext.style.display = "none"
    }
}

const getIndexById = (id) => {
    return cart.findIndex(i => i.id === id)
}

const increaseItemAmount = (id) => {
    const index = getIndexById(id)

    cart[index].amount += 1
    const elAmount = document.querySelector('[data-amount="[' + id + ']"]');
    elAmount.innerText = cart[index].amount
    updateCart()
}

const decreaseItemAmount = (id) => {
    const index = getIndexById(id)

    if (cart[index].amount > 1) {
        cart[index].amount -= 1
        const elAmount = document.querySelector('[data-amount="[' + id + ']"]');
        elAmount.innerText = cart[index].amount
    } else if (cart[index].amount === 1) {
        removeMovieCart(id)
    }
    updateCart()
}


const checkLocalStorage = () => {
    const check = localStorage.getItem("cart") === null
    if (!check) {
        const data = JSON.parse(localStorage.getItem("cart"))
        console.log(data)
        cart = []
        cart = data
        updateCart()

        if (cart.length > 0) {
            sidebarContent.style.display = "none"
            buttonNext.style.display = "flex"
        }
    }

    if (localStorage.getItem("cart") !== null) {
        inputCode.value = "htmlnaoelinguagem"
    }
}

const saveLocalStorage = (arrayCart) => {
    localStorage.clear()
    localStorage.setItem("cart", JSON.stringify(arrayCart))

    if (inputCode.value === "htmlnaoelinguagem") {
        localStorage.setItem("coupon", "htmlnaoelinguagem")
    }
}

document.getElementById("submit-form").addEventListener("click", function () {
    console.log(validateForm())
    form.submit()
})


const validateForm = () => {
    // const fields = ["name", "phone", "email",
    //     "cep", "address-number", "country", "neighborhood",
    //     "card-number", "date-expired", "card-name", "card-cvv"]

    const fields = ["name"]

    let i, l = fields.length;
    let fieldname
    for (i = 0; i < l; i++) {
        fieldname = fields[i]
        if (form[fieldname].value === "") {
            alert(fieldname + " está vázio!")       

            return false
        }
    }
    return true
}


checkLocalStorage()


