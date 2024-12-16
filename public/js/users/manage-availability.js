$(window).on("load", () => {
    const form = $("#manage-availability-form");

    const updateCurrentAvailability = (avlArray) => {
        const currentAvailabilityDiv = $("#curr-avl-div");
        currentAvailabilityDiv.empty();

        avlArray.forEach((element) => {
            const { day, start_time, end_time } = element;
            const divElement = `<div id="avl-${day}" class="col-sm-auto col-md-auto mx-auto">
                            <div class="card text-bg-dark pt-2">
                                <div class="card-title"><h5>${day}</h5></div>
                                <div class="card-body">
                                    <p class="start-time">Start Time: ${start_time}</p>
                                    <p class="end-time">End Time: ${end_time}</p>
                                </div>
                            </div>
                        </div>`;
            currentAvailabilityDiv.append(divElement);
        });
    };

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

        $.ajax({
            type: "POST",
            url: window.location.href,
            data: JSON.stringify(payload),
            contentType: "application/json",
            success: (response) => {
                const availability = response.availability;
                updateCurrentAvailability(availability);
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                console.error("XMLHttpRequest", XMLHttpRequest);
                console.error("textStatus", textStatus);
                console.error("errorThrown", errorThrown);
            },
        });
    });
});
