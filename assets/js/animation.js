(function () {
    "use strict";

    const q = (seletor) => document.querySelector(seletor);
    const qa = (seletor) => document.querySelectorAll(seletor);

    const setScroll = () => {
        const btnScroll = q("#btn-scroll");

        window.addEventListener('scroll', () => {
            window.scrollY > 150 ? btnScroll.classList.add("active") : btnScroll.classList.remove("active");
        });

        btnScroll.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        });
    };

    setScroll();
})();