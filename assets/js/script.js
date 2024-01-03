(function () {
    "use strict";

    const q = (seletor) => document.querySelector(seletor);
    const qa = (seletor) => document.querySelectorAll(seletor);

    const replaceSVGImages = () => {
        const imgs = qa(".svg");

        imgs.forEach(img => {
            const
                id = img.getAttribute("id"),
                imgClass = img.getAttribute("class"),
                url = img.getAttribute("src");

            fetch(url)
                .then((response) => {
                    return response.text();
                })
                .then((data) => {
                    // Create a new div element and set its innerHTML to the SVG content
                    const icon = document.createElement("i");
                    icon.innerHTML = data;

                    const svg = icon.querySelector("svg"); // Get the SVG tag from the div                
                    if (id) svg.setAttribute("id", id); // Add replaced image's ID to the new SVG
                    if (imgClass) svg.setAttribute("class", imgClass); // Add replaced image's classes to the new SVG                    

                    svg.removeAttribute("xmlns:a"); // Remove any invalid XML tags   
                    img.parentNode.replaceChild(icon, img); // Replace image with new SVG
                })
        });
    };

    replaceSVGImages();
})();