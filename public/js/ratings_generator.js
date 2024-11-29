(() => {
    const zeroStarElement = document.createElement("i");
    zeroStarElement.classList.add("fa-regular", "fa-star");

    const oneStarElement = document.createElement("i");
    oneStarElement.classList.add("fa-solid", "fa-star");
    oneStarElement.style.color = "#fba209";

    const halfStarElement = document.createElement("i");
    halfStarElement.classList.add("fa-solid", "fa-star-half-stroke");
    halfStarElement.style.color = "#fba209";

    const createRatingsDiv = (element) => {
        let rating = parseInt(element.getAttribute("data-rating") || 0);

        const nOneStars = Math.floor(rating);
        const nHalfStars = Math.round((5 - rating) % 1);
        const nZeroStars = 5 - nOneStars - nHalfStars;

        for (let index = 0; index < nOneStars; index++) {
            element.appendChild(oneStarElement.cloneNode());
        }
        for (let index = 0; index < nHalfStars; index++) {
            element.appendChild(halfStarElement.cloneNode());
        }
        for (let index = 0; index < nZeroStars; index++) {
            element.appendChild(zeroStarElement.cloneNode());
        }
    };

    const ratingDivs = document.getElementsByClassName("ratings-render");

    for (let index = 0; index < ratingDivs.length; index++) {
        const element = ratingDivs[index];
        createRatingsDiv(element);
    }
})();
