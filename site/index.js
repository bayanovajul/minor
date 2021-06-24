document.getElementById("nav-bar").addEventListener("click", navigationManager);

let activeRoute = null;

function navigationManager(e) {
    let navRoute = e.target.id;
    if (navRoute === "nav-1" && activeRoute !== navRoute) {
        activeRoute = navRoute;
        stringSearchRoute();
    }
    if (navRoute === "nav-2" && activeRoute !== navRoute) {
        activeRoute = navRoute;
        fileRoute();
    }
    if (navRoute === "nav-3" && activeRoute !== navRoute) {
        activeRoute = navRoute;
        dbRoute();
    }
    if (navRoute === "nav-4" && activeRoute !== navRoute) {
        activeRoute = navRoute;
        shopRoute();
    }
    if (navRoute === "nav-5" && activeRoute !== navRoute) {
        activeRoute = navRoute;
        diagramsRoute();
    }
}

const SERVER_URL = "http://127.0.0.1:5000";

async function getDataFromServer(url) {
    const response = await fetch(url, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

async function postDataToServer(url, data) {
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

function appendHeaderToTable(table) {
    let tr = document.createElement("tr");
    let countryName = document.createElement("td");
    let summaryInfected = document.createElement("td");
    let dailyInfected = document.createElement("td");
    countryName.textContent = "Страна";
    summaryInfected.textContent = "Всего заражений";
    dailyInfected.textContent = "Заражений на 20.06.2021";
    tr.appendChild(countryName);
    tr.appendChild(summaryInfected);
    tr.appendChild(dailyInfected);
    table.appendChild(tr);
}

function fillCovidTable(table, data) {
    for (let countryNameIndex in data) {
        let tr = document.createElement("tr");
        let countryName = document.createElement("td");
        let summaryInfected = document.createElement("td");
        let dailyInfected = document.createElement("td");
        countryName.textContent = countryNameIndex;
        summaryInfected.textContent = data[countryNameIndex].total;
        dailyInfected.textContent = data[countryNameIndex].for_date;
        tr.appendChild(countryName);
        tr.appendChild(summaryInfected);
        tr.appendChild(dailyInfected);
        table.appendChild(tr);
    }
}

function stringSearchRoute() {
    let main = document.getElementById("main");
    main.innerHTML = "";

    getDataFromServer(SERVER_URL + "/string_data").then(data => {
        // let covidData = data.data;

        let table = document.createElement("table");
        appendHeaderToTable(table);
        fillCovidTable(table, data.data);

        let inputField = document.createElement("input");
        inputField.type = "text";
        inputField.placeholder = "Введите страну"
        inputField.id = "search-string";
        let buttonSearch = document.createElement("button");
        buttonSearch.textContent = "Поиск";
        buttonSearch.onclick = function () {
            let searchText = document.getElementById("search-string").value;
            if (searchText === "" || searchText === undefined){
                alert("You must input something");
                return;
            }
            postDataToServer(SERVER_URL + "/string_search", {search: searchText}).then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    // let searchedItem = data.data;
                    table.innerHTML = "";
                    appendHeaderToTable(table);
                    fillCovidTable(table, data.data);
                }
            })

        }
        let refresh = document.createElement("button");
        refresh.onclick = function () {
            stringSearchRoute();
        }
        refresh.textContent = "Обновить";

        main.appendChild(inputField);
        main.appendChild(buttonSearch);
        main.appendChild(refresh);
        main.appendChild(table);
    })
}

function fileRoute() {
    let main = document.getElementById("main");
    main.innerHTML = "";

    getDataFromServer(SERVER_URL + "/file_data").then(data => {
        let inputField = document.createElement("input");
        inputField.type = "text";
        inputField.placeholder = "Новая запись"
        inputField.id = "new-string";
        let buttonNew = document.createElement("button");
        buttonNew.textContent = "Добавить запись";
        buttonNew.onclick = function () {
            let newText = document.getElementById("new-string").value;
            if (newText === "" || newText === undefined){
                alert("You must input something");
                return;
            }
            newText = newText + "  |  " + (new Date()).toLocaleString("RU-ru")
            postDataToServer(SERVER_URL + "/add_file_data", {new_string: newText}).then(data => {
                fileRoute();
            })

        }
        let removeLast = document.createElement("button");
        removeLast.onclick = function () {
            getDataFromServer(SERVER_URL + "/remove_last_line").then(data => {
                fileRoute();
            })
        }
        removeLast.textContent = "Удалить последнюю запись";

        let removeAll = document.createElement("button");
        removeAll.onclick = function () {
            getDataFromServer(SERVER_URL + "/remove_all_data").then(data => {
                fileRoute();
            })
        }
        removeAll.textContent = "Удалить все";

        let notes = document.createElement("div");
        for (let i in data.data) {
            let p = document.createElement("p");
            p.textContent = data.data[i];
            notes.appendChild(p);
        }

        main.appendChild(inputField);
        main.appendChild(buttonNew);
        main.appendChild(removeLast);
        main.appendChild(removeAll);
        main.appendChild(notes);
    })
}

function appendItemsHeaderToTable(table) {
    let tr = document.createElement("tr");
    let item_id = document.createElement("td");
    let name = document.createElement("td");
    let price = document.createElement("td");
    let img_url = document.createElement("td");
    let purchases = document.createElement("td");
    item_id.textContent = "ID";
    name.textContent = "Наименование товара";
    price.textContent = "Цена";
    img_url.textContent = "Ссылка на изображение";
    purchases.textContent = "Всего покупок";
    tr.appendChild(item_id);
    tr.appendChild(name);
    tr.appendChild(price);
    tr.appendChild(img_url);
    tr.appendChild(purchases);
    table.appendChild(tr);
}

function fillItemsTable(table, data) {
    for (let item_index in data) {
        let tr = document.createElement("tr");
        let item_id = document.createElement("td");
        let name = document.createElement("td");
        let price = document.createElement("td");
        let img_url = document.createElement("td");
        let purchases = document.createElement("td");
        item_id.textContent = data[item_index].id;
        name.textContent = data[item_index].name;
        price.textContent = data[item_index].price;
        img_url.textContent = data[item_index].img_url;
        purchases.textContent = data[item_index].purchases;
        tr.appendChild(item_id);
        tr.appendChild(name);
        tr.appendChild(price);
        tr.appendChild(img_url);
        tr.appendChild(purchases);
        table.appendChild(tr);
    }
}

function dbRoute() {
    let main = document.getElementById("main");
    main.innerHTML = "";

    getDataFromServer(SERVER_URL + "/get_db_data").then(data => {
        let table = document.createElement("table");
        appendItemsHeaderToTable(table);
        fillItemsTable(table, data.data);

        let nameField = document.createElement("input");
        nameField.type = "text";
        nameField.placeholder = "Введите наименование товара"
        nameField.id = "item-name";

        let priceField = document.createElement("input");
        priceField.type = "number";
        priceField.placeholder = "Введите цену"
        priceField.id = "item-price";

        let imgUrlField = document.createElement("input");
        imgUrlField.type = "text";
        imgUrlField.placeholder = "Ссылка на картинку"
        imgUrlField.id = "item-url";

        let buttonCreate = document.createElement("button");
        buttonCreate.textContent = "Добавить товар";
        buttonCreate.onclick = function () {
            let nameField = document.getElementById("item-name").value;
            if (nameField === "" || nameField === undefined){
                alert("Вы должны ввести название товара");
                return;
            }

            let priceField = document.getElementById("item-price").value;
            if (priceField === "" || priceField === undefined){
                alert("Вы должны ввести цену товара");
                return;
            }

            let imgUrlField = document.getElementById("item-url").value;
            if (imgUrlField === "" || imgUrlField === undefined){
                alert("Вы должны указать ссылку на картинку товара");
                return;
            }

            postDataToServer(SERVER_URL + "/add_item_in_db", {
                item: {name: nameField, price: priceField, img_url: imgUrlField}
            }).then(data => {
                dbRoute()
            })

        }
        main.appendChild(nameField);
        main.appendChild(priceField);
        main.appendChild(imgUrlField);
        main.appendChild(buttonCreate);
        main.appendChild(table);
    })
}

function shopRoute() {
    let main = document.getElementById("main");
    main.innerHTML = "";

    getDataFromServer(SERVER_URL + "/get_db_data").then(data => {
        let items = data.data;
        let itemsContainer = document.createElement("div");
        itemsContainer.className = "items-container";
        for (let i in items) {
            let card = document.createElement("div");
            card.className = "card";

            let name = document.createElement("p");
            name.className = "card-name";
            name.textContent = items[i].name;

            let imgContainer = document.createElement("div");
            imgContainer.className = "card-image-container";

            let image = document.createElement("img");
            image.src = items[i].img_url;
            image.alt = "Item image";

            imgContainer.appendChild(image);

            let price = document.createElement("p");
            price.className = "card-price";
            price.textContent = "Цена: " + items[i].price;

            let buttonBuy = document.createElement("button");
            buttonBuy.textContent = "Купить товар";
            buttonBuy.onclick = function () {
                postDataToServer(SERVER_URL + "/purchase", {
                    item_id: items[i].id,
                    number: items[i].purchases + 1
                }).then(data => {
                    alert("Товар успешно приобретен");
                    shopRoute();
                })
            }

            card.appendChild(name);
            card.appendChild(imgContainer);
            card.appendChild(price);
            card.appendChild(buttonBuy);

            itemsContainer.appendChild(card);
            main.appendChild(itemsContainer);
        }
    })
}

function diagramsRoute() {
    let main = document.getElementById("main");
    main.innerHTML = "";

    getDataFromServer(SERVER_URL + "/get_diagrams").then(data => {
        let imgContainer1 = document.createElement("div");
        imgContainer1.innerHTML = data.data.img1;
        imgContainer1.className = "diagram-image-container";

        let imgContainer2 = document.createElement("div");
        imgContainer2.innerHTML = data.data.img2;
        imgContainer2.className = "diagram-image-container";

        main.appendChild(imgContainer1);
        main.appendChild(imgContainer2);
    })
}