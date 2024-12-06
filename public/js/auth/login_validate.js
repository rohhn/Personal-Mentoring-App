document.addEventListener("DOMContentLoaded", () => {
    const formConstraints = {
        ["email"]: {
            presence: {
                allowEmpty: false,
            },
            type: "string",
            email: true,
            length: {
                minimum: 5,
                maximum: 40,
            },
        },
        password: {
            presence: {
                allowEmpty: false,
            },
            type: "string",
        },
    };
    const logInForm = document.getElementById("login-form");

    const validateAndSubmitForm = (event) => {
        event.preventDefault();

        let validateResult = validate(event.target, formConstraints, {
            format: "flat",
        });

        if (validateResult) {
            alert(validateResult[0]);
            return;
        }

        const user_type = document.querySelector(
            'input[name="user_type"]:checked'
        ).value;

        validateResult = validate.single(user_type, {
            inclusion: ["mentor", "mentee"],
        });

        if (validateResult) {
            alert(validateResult[0]);
            return;
        }

        event.target.submit();
    };

    if (logInForm) {
        logInForm.addEventListener("submit", validateAndSubmitForm);
    }
});
