(function () {
    "use strict";

    const 
        body = document.body,
        dark_theme = document.querySelectorAll(".dark"),
        icon_theme = document.querySelector(".theme-icon");

    const setdarkmode = () => {
        body.classList.add("dark");
        body.classList.remove("light");
        dark_theme.forEach(tag => tag.classList.add("dark"));
        dark_theme.forEach(tag => tag.classList.remove("light"));
    }

    const setlightmode = () => {
        body.classList.add("light");
        body.classList.remove("dark");
        dark_theme.forEach(tag => tag.classList.add("light"));
        dark_theme.forEach(tag => tag.classList.remove("dark"));
    }

    icon_theme.addEventListener("click", () => {
        if (body.classList.contains("dark")) setlightmode();
        else setdarkmode();
    });
})();