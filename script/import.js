fetch("parts/footer.html")
    .then((response) => response.text())
    .then((data) => document.querySelector("#footer").innerHTML = data);
fetch("forms/contact.html")
    .then((response) => response.text())
    .then((data) => document.querySelector("#forms").innerHTML = data);