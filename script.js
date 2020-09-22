const listTopMovies = document.querySelector('.top-list')
const listMovies = document.querySelector('.movies-list')
const cartList = document.querySelector('.cart-items')
const buttonCart = document.querySelector('.cart-button')
const buttonCartTotal = document.querySelector('.cart-button span')
const ads = document.querySelector('#ads')
const sidebarContent = document.querySelector('.sidebar .content')
const buttonNext = document.querySelector('.cart-button')

const filters = document.querySelector('.filters')
const loading = document.querySelector('.loading');

const inputCode = document.querySelector('#code_coupon')

let cart = []
let movies = []
let genresMovies = []
let totalCart = 0
let pg = 1
let fixedGenre = 0



const fecthJson = async (url) => {
    return await fetch(url)
        .then(response => response.json())
}

fecthJson('https://tmdb-proxy-workers.vhfmag.workers.dev/3/discover/movie?language=pt-BR')
    .then(({ results }) => {

        results.slice(0, 5).forEach((result) => {
            let movie = {
                id: result.id,
                title: result.original_title,
                image: result.poster_path,
                vote_average: result.vote_average,
                price: 249,
                amount: 1
            }
            movies.push(movie)
        })

        updateTopMovies()

    })


fecthJson('https://tmdb-proxy-workers.vhfmag.workers.dev/3/genre/movie/list?language=pt-BR')
    .then(({ genres }) => {
        genres.slice(0, 4).forEach((result) => {
            let genre = {
                id: result.id,
                name: result.name
            }
            genresMovies.push(genre)
            createButtonsFilters(result.name, result.id)
        })
    })

const movieByGenre = (id, pg = 1) => {
    let url = id === 0 ? `https://tmdb-proxy-workers.vhfmag.workers.dev/3/discover/movie?page=${pg}language=pt-BR`
        : `https://tmdb-proxy-workers.vhfmag.workers.dev/3/discover/movie?with_genres=${id}&page=${pg}&language=pt-BR`

    if (pg === 1) {
        movies = movies.slice(0, 5)
    }

    fecthJson(url)
        .then(({ results }) => {
            results.forEach((result) => {
                let movie = {
                    id: result.id,
                    title: result.original_title,
                    image: result.poster_path,
                    vote_average: result.vote_average,
                    price: 249,
                    amount: 1
                }
                movies.push(movie)
            })

            updateListMovies()

        })
}


const updateTopMovies = () => {
    listTopMovies.innerHTML = movies.map(({ id, title, image, vote_average, price }) => {
        const priceFinal = (price / 100).toFixed(2).replace(".", ",")
        return `
        <li onclick="addToCart(${id})">
            <img class="thumbnail" src="${image}" alt="${title}">
            <button class="favorite"><img src="images/star.svg" alt="Favorito"></button>
            <div class="content-list">
                <div class="info">
                    <h2>${title}</h2>
                    <span> <img src="images/star-rating.svg" alt="rating"> ${vote_average}</span>
                </div>
                <div class="info-price">
                    <p>Sacola</p>
                    <p>R$ ${priceFinal}</p>
                </div>
            </div>
        </li>
    `
    }).join('')

}

const updateListMovies = () => {

    listMovies.innerHTML = movies.slice(5).map(({ id, title, image, vote_average, price }) => {
        const priceFinal = (price / 100).toFixed(2).replace(".", ",")
        return `
        <li onclick="addToCart(${id})">
            <img class="thumbnail" src="${image}" alt="${title}">
            <button class="favorite"><img src="images/star.svg" alt="Favorito"></button>
            <div class="content-list">
                <div class="info">
                    <h2>${title}</h2>
                    <span> <img src="images/star-rating.svg" alt="rating"> ${vote_average}</span>
                </div>
                <div class="info-price">
                    <p>Sacola</p>
                    <p>R$ ${priceFinal}</p>
                </div>
            </div>
        </li>
    `
    }).join('')

}

const createButtonsFilters = (genre, id) => {
    const button = document.createElement('button')
    button.innerText = genre
    button.setAttribute('onclick', `clickButtonGenre(this)`)
    button.setAttribute('data-filter', id)
    // filters.innerHTML(buttonAll)
    filters.appendChild(button)
}

const clickButtonGenre = (event) => {
    const buttons = filters.querySelectorAll('button')
    removeClassActive(buttons)

    event.classList.add('active')

    const id = parseInt(event.getAttribute('data-filter'))

    movieByGenre(id)
}

const removeClassActive = (buttons) => {
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].classList.contains('active')) {
            buttons[i].classList.remove('active')
        }
    }
}

const addToCart = (id) => {
    let movieExist = false
    cart.forEach(el => {
        if (el.id !== undefined && el.id === id) {
            movieExist = true
        }
    });

    if (!movieExist) {
        const movie = movies.find(item => item.id === id)
        cart.push(movie)
        updateCart()
    }
    if (cart.length > 0) {
        sidebarContent.style.display = "none"
    }
}

const removeMovieCart = (id) => {
    const index = getIndexById(id)
    if (index > -1) {
        cart.splice(index, 1)
    }

    if (cart.length === 0) {
        sidebarContent.style.display = "flex"
    }
}

const getIndexById = (id) => {
    return cart.findIndex(i => i.id === id)
}


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
    if (localStorage.getItem("coupon") === "htmlnaoelinguagem") {
        discount = 50
    }

    let priceTotal = cart.reduce((total, { amount, price }) => {
        return amount * price + total
    }, 0)

    priceTotal = priceTotal - (priceTotal / 100 * discount)

    priceTotal = (priceTotal / 100).toFixed(2).replace(".", ",")

    buttonCartTotal.innerText = priceTotal

    saveLocalStorage(cart)

    if (cart.length > 0) {
        sidebarContent.style.display = "none"
        buttonNext.style.display = "flex"
    } else {
        buttonNext.style.display = "none"
    }

}


const increaseItemAmount = (id) => {
    const index = getIndexById(id)

    cart[index].amount += 1
    const elAmount = document.querySelector('[data-amount="[' + id + ']"]')
    elAmount.innerText = cart[index].amount
    updateCart()
}

const decreaseItemAmount = (id) => {
    const index = getIndexById(id)

    if (cart[index].amount > 1) {
        cart[index].amount -= 1
        const elAmount = document.querySelector('[data-amount="[' + id + ']"]')
        elAmount.innerText = cart[index].amount
    } else if (cart[index].amount === 1) {
        removeMovieCart(id)
    }
    updateCart()
}

const bannerPromo = () => {
    const banner = `
    <div class="ads-info">
      <h3>APROVEITAR AGORA</h3>
        <span class="ads-coupon">
         <img src="images/icon-coupon.svg" alt="coupon">
         <a href="#code" class="code"> CUPOM: htmlnaoelinguagem</a>
       </span>
    </div>

    <div class="ads-info">
        <h3>FINALIZA EM?</h3>
        <span class="ads-coupon">
            <img src="images/icon-timer.svg" alt="coupon">
            <p class="timer"></p>
        </span>
    </div>

    <div class="ads-img">
        <img class="ads-money" src="images/money.png" alt="money">
    </div>     
    `
    ads.innerHTML = banner

    let fiveMinutes = 60 * 5
    const display = document.querySelector('.ads-coupon .timer')
    timer(fiveMinutes, display)

    ads.addEventListener("click", () => {
        inputCode.value = "htmlnaoelinguagem"
        ads.style.display = "none"
        localStorage.setItem("coupon", "htmlnaoelinguagem")
        updateCart()
    })

}

const saveLocalStorage = (arrayCart) => {
    // localStorage.clear()
    localStorage.setItem("cart", JSON.stringify(arrayCart))

    const codeInput = document.querySelector('#code_coupon')

    if (codeInput.value === "htmlnaoelinguagem") {
        localStorage.setItem("coupon", "htmlnaoelinguagem")
    }
}

const checkLocalStorage = () => {
    const check = localStorage.getItem("cart") === null
    if (!check) {
        const data = JSON.parse(localStorage.getItem("cart"))

        cart = []
        cart = data
        updateCart()

        if (localStorage.getItem("coupon") !== null) {
            inputCode.value = "htmlnaoelinguagem"
            ads.style.display = "none"
        }
    }


    if (cart.length > 0) {
        sidebarContent.style.display = "none"
        buttonNext.style.display = "flex"
    } else {
        buttonNext.style.display = "none"
    }


}


const timer = (duration, display) => {
    let timer = duration, minutes, seconds
    const myTimer = setInterval(function () {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10)

        minutes = minutes < 10 ? "0" + minutes : minutes
        seconds = seconds < 10 ? "0" + seconds : seconds

        display.textContent = minutes + ":" + seconds

        if (--timer < 0) {
            clearInterval(myTimer)
            timer = duration
            ads.innerHTML = ""
        }
    }, 1000)

}

buttonNext.addEventListener("click", () => {
    saveLocalStorage(cart)
})




bannerPromo()
movieByGenre(0)
checkLocalStorage()


