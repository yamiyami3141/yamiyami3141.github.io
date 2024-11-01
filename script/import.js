fetch("parts/footer.html")
    .then((response) => response.text())
    .then((data) => document.querySelector("#footer").innerHTML = data);

fetch("forms/contact.html")
    .then((response) => response.text())
    .then((data) => document.querySelector("#forms").innerHTML = data);

fetch("parts/loading.html")
    .then((response) => response.text())
    .then((data) => document.querySelector("#loading").innerHTML = data);

fetch("parts/script.html")
    .then((response) => response.text())
    .then((data) => document.querySelector("#script").innerHTML = data);