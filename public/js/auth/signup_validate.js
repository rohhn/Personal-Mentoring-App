document.addEventListener("DOMContentLoaded", () => {
    validate.extend(validate.validators.datetime, {
        // The value is guaranteed not to be null or undefined but otherwise it
        // could be anything.
        parse: function (value, options) {
            return +moment.utc(value);
        },
        // Input is a unix timestamp
        format: function (value, options) {
            var format = options.dateOnly
                ? "YYYY-MM-DD"
                : "YYYY-MM-DD hh:mm:ss";
            return moment.utc(value).format(format);
        },
    });

    const formConstraints = {
        first_name: {
            presence: {
                allowEmpty: false,
            },
            type: "string",
            length: {
                minimum: 2,
                maximum: 15,
            },
        },
        last_name: {
            presence: {
                allowEmpty: false,
            },
            type: "string",
            length: {
                minimum: 2,
                maximum: 20,
            },
        },
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
        dob: {
            presence: {
                allowEmpty: false,
            },
            datetime: {
                dateOnly: true,
            },
        },
        summary: {
            presence: {
                allowEmpty: false,
            },
            type: "string",
            length: {
                minimum: 25,
                maximum: 200,
            },
        },
        password: {
            presence: {
                allowEmpty: false,
            },
            type: "string",
            length: {
                minimum: 8,
            },
            format: {
                pattern:
                    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
            },
        },
    };
    const signUpForm = document.getElementById("signup-form");

    const validateAndSubmitForm = (event) => {
        event.preventDefault();

        // const formData = new FormData(event.target);

        // perform validation on all common fields
        const validateResult = validate(event.target, formConstraints, {
            format: "flat",
        });

        if (validateResult) {
            alert(validateResult[0]);
            return;
        }

        const user_type = document.querySelector(
            'input[name="user_type"]:checked'
        ).value;

        if (user_type === "mentor") {
            // no further validation required
        } else if (user_type === "mentee") {
            let parent_email = document.querySelector(
                'input[name="parent_email"]'
            );
            if (parent_email) {
                parent_email = parent_email.value;
                const validateResult = validate(
                    { parent_email },
                    {
                        ["parent_email"]: {
                            presence: {
                                allowEmpty: false,
                            },
                            type: "string",
                            email: true,
                        },
                    },
                    { format: "flat" }
                );

                if (validateResult) {
                    alert(validateResult[0]);
                    return;
                }
            }
        } else {
            alert("User type is invalid.");
            return;
        }

        event.target.submit();
    };

    if (signUpForm) {
        signUpForm.addEventListener("submit", validateAndSubmitForm);
    }
});
