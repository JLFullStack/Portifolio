(function () {
    "use strict";

    const q = (seletor) => document.querySelector(seletor);
    const qa = (seletor) => document.querySelectorAll(seletor);

    const 
        body = document.body,
        btn_ligth = q("#btn-ligth"),
        btn_dark = q("#btn-dark"),
        theme_icon = qa(".theme-icon");

    const setDarkMode = () => {
        body.classList.add("dark");
        body.classList.remove("light");
        btn_dark.style = "display:block";
        btn_ligth.style = "display:none";
    }

    const setLightMode = () => {
        body.classList.add("light");
        body.classList.remove("dark");
        btn_dark.style = "display:none";
        btn_ligth.style = "display:block";
    }


    theme_icon.forEach ( icon => 
        icon.addEventListener("click", () => {
            body.classList.contains("dark") ? setLightMode() : setDarkMode();
    }));
})();