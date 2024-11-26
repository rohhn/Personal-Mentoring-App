(() => {
    const calculateAge = (dob) => {
        const today = new Date();
        let birthday = new Date(dob);

        if (birthday !== "") {
            let age =
                today.getFullYear() -
                birthday.getFullYear() -
                (today.getMonth() < birthday.getMonth() ||
                    (today.getMonth() === birthday.getMonth() && today.getDate() < birthday.getDate()));
            return age;
        }

        return;
    };

    const addParentEmailInput = () => {
        const formElement = document.getElementById("signup-form");

        const parentsEmailDiv = document.createElement("div");
        const parentsEmailLabel = document.createElement("label");
        const parentsEmailInput = document.createElement("input");

        parentsEmailDiv.classList.add("form-group", "mb-2");
        parentsEmailDiv.setAttribute("id", "parent-email-div");

        parentsEmailLabel.innerHTML = "Guardian's Email";

        parentsEmailInput.setAttribute("type", "email");
        parentsEmailInput.setAttribute("name", "parent_email");
        parentsEmailInput.classList.add("form-control");

        parentsEmailDiv.appendChild(parentsEmailLabel);
        parentsEmailDiv.appendChild(parentsEmailInput);

        formElement.insertBefore(parentsEmailDiv, formElement.lastElementChild);
    };

    const dobInputChanged = (event) => {
        const user_type = document.querySelector('input[name="user_type"]:checked').value;

        if (!user_type) {
            throw Error("User type is invalid.");
        }

        if (user_type === "mentee") {
            const dob = document.getElementById("dob-input").value;

            const age = calculateAge(dob);

            if (typeof age !== "undefined") {
                if (age < 16) {
                    addParentEmailInput();
                } else {
                    const parentsEmailDiv = document.getElementById("parent-email-div");
                    if (parentsEmailDiv) {
                        parentsEmailDiv.innerHTML = "";
                    }
                }
            }
        }
    };

    const dobInputElement = document.getElementById("dob-input");
    const formMaxDate = new Date().toISOString().substring(0, 10);
    dobInputElement.setAttribute("max", formMaxDate);

    dobInputElement.addEventListener("change", dobInputChanged);
})();
