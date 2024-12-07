$(window).on("load", () => {
    const form = $("#manage-availability-form");

    form.on("submit", (event) => {
        event.preventDefault();

        const formContraints = {
            day: {
                presence: {
                    allowEmpty: false,
                },
                type: "string",
                inclusion: {
                    within: [
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                    ],
                },
            },
            start_time: {
                presence: {
                    allowEmpty: false,
                },
                type: "string",
                format: {
                    pattern: /\d{2}:\d{2}/,
                },
            },
            end_time: {
                presence: {
                    allowEmpty: false,
                },
                type: "string",
                format: {
                    pattern: /\d{2}:\d{2}/,
                },
            },
        };

        const validateResult = validate(event.target, formContraints, {
            format: "flat",
        });

        if (validateResult) {
            alert(validateResult[0]);
            return;
        } else {
            console.log("form is valid.");
        }

        const formValues = validate.collectFormValues(event.target);
        const payload = {
            av: [formValues],
        };
        const apiURL = window.location.href;

        // TODO: Complete once API is fixed.
        $.ajax({
            type: "POST",
            url: window.location.href,
            data: JSON.stringify(payload),
            contentType: "application/json",
            success: (response) => {
                console.log(response);
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                console.error("XMLHttpRequest", XMLHttpRequest);
                console.error("textStatus", textStatus);
                console.error("errorThrown", errorThrown);
            },
        });
    });
});
