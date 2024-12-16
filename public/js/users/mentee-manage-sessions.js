(function ($) {
    $(document).ready(function () {
        $(".reschedule-btn").each(function () {
            $(this).on(
                "click",
                // { session_id: window.location.href.split("/").slice(-1) },
                openRescheduler
            );
        });

        $(".cancel-btn").each(function () {
            $(this).on(
                "click",
                { session_id: window.location.href.split("/").slice(-1) },
                handleCancelSession
            );
        });
    });

    function openRescheduler(event) {
        // console.log(event.data); // passed with "on" bind
        // console.log(event.target.dataset); // passed from HTML data attrs
        const rescheduleModalObj = new bootstrap.Modal("#rescheduleModal");
        const rescheduleModalEle = $("#rescheduleModal");

        let date = new Date();
        $("#next").click({ date: date }, next_year);
        $("#prev").click({ date: date }, prev_year);
        $(".month").click({ date: date }, month_click);

        // Set current month as active
        $(".months-row")
            .children()
            .eq(date.getMonth())
            .addClass("active-month");

        init_calendar(date, event.target.dataset);

        rescheduleModalObj.show();
    }

    function handleCancelSession(event) {
        // console.log(event.data);
        const apiUrl = `${window.location.origin}/sessions/${event.target.dataset.sessionId}`;

        $.ajax({
            type: "DELETE",
            url: apiUrl,
            success: (response) => {
                // window.location.href = `${window.location.origin}/dashboard`;
                const deleteElement = $(
                    `#session-card-${event.target.dataset.sessionId}`
                );
                deleteElement.remove();
                triggerToast("Session deleted!", "info");
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                console.error("XMLHttpRequest", XMLHttpRequest);
                console.error("textStatus", textStatus);
                console.error("errorThrown", errorThrown);
                // alert(XMLHttpRequest.responseJSON.error || errorThrown);
                triggerToast(
                    XMLHttpRequest.responseJSON.error || errorThrown,
                    "error"
                );
            },
        });
    }

    function makeBookingForm(response, eventData) {
        // show the booking form
        // {
        //     "mentor_id": "mentor_id",
        //     "mentee_id": "mentor_id",
        //     "subject_area": "674cb8767e290b0de5ec2978",
        //     "start_time": "2024-12-01T17:00:00Z",
        //     "end_time": "2024-12-01T17:30:00Z"
        // }

        const bookingForm = $(
            `<form name="make-session" id="make-session-form"></form>`
        );

        const fromTimeInput = $(`<div class="row form-group mb-2">
                    <div class="col-sm-3">
                        <h6 class="mb-0">From</h6>
                    </div>
                    <div class="col-sm-9 text-secondary">
                        <input
                            class="form-control"
                            name="start_time"
                            id="start_time"
                            type="time"
                            list="start-time-list"
                        />
                        <datalist id="start-time-list">
                            <option value="08:00"/>
                            <option value="09:00"/>
                            <option value="10:00"/>
                            <option value="11:00"/>
                            <option value="12:00"/>
                            <option value="13:00"/>
                            <option value="14:00"/>
                            <option value="15:00"/>
                            <option value="16:00"/>
                            <option value="17:00"/>
                            <option value="18:00"/>
                            <option value="19:00"/>
                            <option value="20:00"/>
                            <option value="21:00"/>
                        </datalist>
                    </div>
                </div>`);
        bookingForm.append(fromTimeInput);

        const toTimeInput = $(`<div class="row form-group mb-2">
                    <div class="col-sm-3">
                        <h6 class="mb-0">To</h6>
                    </div>
                    <div class="col-sm-9 text-secondary">
                        <input
                            class="form-control"
                            name="end_time"
                            id="end_time"
                            type="time"
                            list="end-time-list"
                        />
                        <datalist id="end-time-list">
                            <option value="08:00"/>
                            <option value="09:00"/>
                            <option value="10:00"/>
                            <option value="11:00"/>
                            <option value="12:00"/>
                            <option value="13:00"/>
                            <option value="14:00"/>
                            <option value="15:00"/>
                            <option value="16:00"/>
                            <option value="17:00"/>
                            <option value="18:00"/>
                            <option value="19:00"/>
                            <option value="20:00"/>
                            <option value="21:00"/>
                        </datalist>
                    </div>
                </div>`);
        bookingForm.append(toTimeInput);

        const submitBtn = $(
            `<button id="make-session-submit" class="btn btn-primary form-control mt-4" type="submit">Book</button>`
        );

        // submitBtn.click(handleBookSession);
        bookingForm.append(submitBtn);

        bookingForm.on("submit", eventData, handleRescheduleSession);

        return bookingForm;
    }

    function rescheduleSession(sessionId, payload) {
        const apiUrl = `${window.location.origin}/sessions/${sessionId}`;
        $.ajax({
            type: "PUT",
            url: apiUrl,
            data: JSON.stringify(payload),
            contentType: "application/json",
            success: (response) => {
                window.location.href = `${window.location.origin}/dashboard`;
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                console.error("XMLHttpRequest", XMLHttpRequest);
                console.error("textStatus", textStatus);
                console.error("errorThrown", errorThrown);
                // alert(XMLHttpRequest.responseJSON.error || errorThrown);
                triggerToast(
                    XMLHttpRequest.responseJSON.error || errorThrown,
                    "error"
                );
            },
        });
    }

    function handleRescheduleSession(event) {
        event.preventDefault();
        const { year, date, month } = event.data;

        const formContraints = {
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
            // alert(validateResult[0]);
            triggerToast(validateResult[0], "error");
            return;
        } else {
            console.log("form is valid.");
        }

        const formValues = validate.collectFormValues(event.target);
        const [startHour, startMin] = $.map(
            formValues.start_time.split(":"),
            (ele) => {
                return parseInt(ele);
            }
        );

        formValues.start_time = moment({
            date,
            year,
            month,
            hour: startHour,
            minute: startMin,
        }).toISOString({ keepOffset: true });

        const [endHour, endMin] = $.map(
            formValues.end_time.split(":"),
            (ele) => {
                return parseInt(ele);
            }
        );
        formValues.end_time = moment({
            date,
            year,
            month,
            hour: endHour,
            minute: endMin,
        }).toISOString({ keepOffset: true });

        rescheduleSession(event.data.dataset.sessionId, formValues);
    }

    function updateAvailabilityDiv(eventData, response) {
        let dayAvl = [];
        if (response.availability) {
            dayAvl = response.availability.filter(
                (avlInfo) =>
                    avlInfo.day.toLowerCase() ===
                    eventData.selectedDay.toLowerCase()
            );
        }

        const avlDiv = $("#availability-div");
        avlDiv.empty();

        if (dayAvl.length == 1) {
            dayAvl = dayAvl[0];

            // show the available time
            avlDiv.append(
                `<p class="fs-6 fw-bold">${response.first_name}&apos;s availability: </p>
                <p class="fs-6 ">From: ${dayAvl.start_time}</p>
                <p class="fs-6 ">To: ${dayAvl.end_time}</p>`
            );
            if (response.subject_areas) {
                avlDiv.append(makeBookingForm(response, eventData));
            } else {
                avlDiv.append(
                    `<p class="fs-6 text-danger">Cannot book sessions with this mentor.</p>`
                );
            }
        } else {
            avlDiv.append(
                `<p class="pt-5 text-center fs-6 fw-lighter fst-italic">No availability.</p>`
            );
        }
    }

    function date_click(event) {
        $(".active-date").removeClass("active-date");
        $(this).addClass("active-date");

        const dateObj = moment({
            year: event.data.year,
            month: event.data.month,
            date: event.data.date,
        });
        const selectedDay = daysOfWeek[dateObj.day()];

        const avlDiv = $("#availability-div");
        avlDiv.empty();
        avlDiv.append(
            `<p class="pt-5 text-center fs-6 fw-lighter fst-italic">Loading availability...</p>`
        );

        const apiUrl = `${window.location.origin}/mentor/${event.data.dataset.mentorId}?api=true`;

        $.ajax({
            type: "GET",
            url: apiUrl,
            contentType: "application/json",
            success: (response) => {
                updateAvailabilityDiv({ ...event.data, selectedDay }, response);
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                console.error("XMLHttpRequest", XMLHttpRequest);
                console.error("textStatus", textStatus);
                console.error("errorThrown", errorThrown);
            },
        });
    }

    // Initialize the calendar by appending the HTML dates
    function init_calendar(date, dataset) {
        $(".tbody").empty();

        var calendar_days = $(".tbody");
        var month = date.getMonth();
        var year = date.getFullYear();
        var day_count = days_in_month(month, year);
        var row = $("<tr class='table-row'></tr>");
        var today = date.getDate();
        // Set date to 1 to find the first day of the month
        date.setDate(1);
        var first_day = date.getDay();
        // 35+firstDay is the number of date elements to be added to the dates table
        // 35 is from (7 days in a week) * (up to 5 rows of dates in a month)
        for (var i = 0; i < 35 + first_day; i++) {
            // Since some of the elements will be blank,
            // need to calculate actual date from index
            var date = i - first_day + 1;
            // If it is a sunday, make a new row
            if (i % 7 === 0) {
                calendar_days.append(row);
                row = $("<tr class='table-row'></tr>");
            }
            // if current index isn't a day in this month, make it blank
            if (i < first_day || date > day_count) {
                var curr_date = $("<td class='table-date nil'>" + "</td>");
                row.append(curr_date);
            } else {
                var curr_date = $(`<td class='table-date'> ${date}</td>`);

                // curr_date.data("mentorId", mentorId);

                if (today === date && $(".active-date").length === 0) {
                    curr_date.addClass("active-date");
                }

                // Set onClick handler for clicking a date
                curr_date.click(
                    {
                        month: month,
                        date: date,
                        year: year,
                        dataset,
                    },
                    date_click
                );
                row.append(curr_date);
            }
        }
        // Append the last row and set the current year
        calendar_days.append(row);
        $(".year").text(year);
    }

    // Get the number of days in a given month/year
    function days_in_month(month, year) {
        var monthStart = new Date(year, month, 1);
        var monthEnd = new Date(year, month + 1, 1);
        return (monthEnd - monthStart) / (1000 * 60 * 60 * 24);
    }

    // Event handler for when a month is clicked
    function month_click(event) {
        // $(".events-container").show(250);
        // $("#dialog").hide(250);
        var date = event.data.date;
        $(".active-month").removeClass("active-month");
        $(this).addClass("active-month");
        var new_month = $(".month").index(this);
        date.setMonth(new_month);
        init_calendar(date);
    }

    // Event handler for when the year right-button is clicked
    function next_year(event) {
        $("#dialog").hide(250);
        var date = event.data.date;
        var new_year = date.getFullYear() + 1;
        $("year").html(new_year);
        date.setFullYear(new_year);
        init_calendar(date);
    }

    // Event handler for when the year left-button is clicked
    function prev_year(event) {
        $("#dialog").hide(250);
        var date = event.data.date;
        var new_year = date.getFullYear() - 1;
        $("year").html(new_year);
        date.setFullYear(new_year);
        init_calendar(date);
    }

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    var daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    var triggerToast = (content, type = undefined) => {
        $("#toast-content").text(content);

        alertToast.removeClass();

        if (type === "danger") {
            alertToast.addClass("text-bg-danger toast");
        } else if (type === "info") {
            alertToast.addClass("text-bg-info toast");
        } else {
            alertToast.addClass("text-bg-dark toast");
        }
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(alertToast);

        toastBootstrap.show();
    };

    const alertToast = $("#alert-toast");
})(jQuery);
