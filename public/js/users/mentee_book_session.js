(function ($) {
    // reference
    // https://colorlib.com/wp/template/calendar-04/

    "use strict";

    // Setup the calendar with the current date
    $(document).ready(function () {
        var date = new Date();
        var today = date.getDate();

        // Set click handlers for DOM elements
        $("#next").click({ date: date }, next_year);
        $("#prev").click({ date: date }, prev_year);
        $(".month").click({ date: date }, month_click);

        // Set current month as active
        $(".months-row")
            .children()
            .eq(date.getMonth())
            .addClass("active-month");

        init_calendar(date);
    });

    // Initialize the calendar by appending the HTML dates
    function init_calendar(date) {
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

    function makeBookingForm(response, selectedDate) {
        // show the booking form
        // {
        //     "mentor_id": "mentor_id",
        //     "mentee_id": "mentor_id",
        //     "subject_area": "674cb8767e290b0de5ec2978",
        //     "start_time": "2024-12-01T17:00:00Z",
        //     "end_time": "2024-12-01T17:30:00Z"
        // }

        const bookingForm = $(
            `<form name="make-session" id="make-session-form" method="POST" action"/sessions"></form>`
        );
        const subjectAreaOptions = $.map(
            response.subject_areas,
            function (element) {
                return `<option value="${element._id}">${element.name}</option>`;
            }
        );

        const subjectAreaInput = $(`<div class="form-group mb-2">
                    <div class="col-sm-3">
                        <h6 class="mb-0">Subject Area</h6>
                    </div>
                    <div class="col-sm-9 text-secondary">
                        <select
                            class="form-control"
                            name="subject_area"
                            id="subject-area-select"
                        >
                            ${subjectAreaOptions.join("\n")}
                        </select>
                    </div>
                </div>`);
        bookingForm.append(subjectAreaInput);

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

        bookingForm.append(
            `<input type='text' name='mentor_id' value='${mentorId}' hidden>`
        );

        const submitBtn = $(
            `<button id="make-session-submit" class="btn btn-primary form-control mt-4" type="submit">Book</button>`
        );

        // submitBtn.click(handleBookSession);
        bookingForm.append(submitBtn);

        bookingForm.on("submit", selectedDate, handleBookSession);

        return bookingForm;
    }

    function bookSession(payload) {
        const apiUrl = `${window.location.origin}/sessions`;
        $.ajax({
            type: "POST",
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
                alert(XMLHttpRequest.responseJSON.error || errorThrown);
            },
        });
    }

    function handleBookSession(event) {
        event.preventDefault();
        const { year, date, month } = event.data;

        const formContraints = {
            subject_area: {
                presence: {
                    allowEmpty: false,
                },
                type: "string",
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
            mentor_id: {
                presence: {
                    allowEmpty: false,
                },
                type: "string",
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
        })
            .add(1, "seconds")
            .toISOString({ keepOffset: true });

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
        })
            .subtract(1, "seconds")
            .toISOString({ keepOffset: true });

        bookSession(formValues);
    }

    function updateAvailabilityDiv(selectedDate, response) {
        let dayAvl = [];
        if (response.availability) {
            dayAvl = response.availability.filter(
                (avlInfo) =>
                    avlInfo.day.toLowerCase() ===
                    selectedDate.selectedDay.toLowerCase()
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
                avlDiv.append(makeBookingForm(response, selectedDate));
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

    // Event handler for when a date is clicked
    function date_click(event) {
        // $(".events-container").show(250);
        // $("#dialog").hide(250);
        $(".active-date").removeClass("active-date");
        $(this).addClass("active-date");

        const dateObj = moment(event.data);
        const selectedDay = daysOfWeek[dateObj.day()];

        const apiUrl = `${window.location.origin}/mentor/${mentorId}?api=true`;

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

    function getMentorAvailability(dayOfWeek) {
        const apiUrl = `${window.location.origin}/mentor/${mentorId}?api=true`;

        $.ajax({
            type: "GET",
            url: apiUrl,
            contentType: "application/json",
            success: (response) => {
                const availability = response.availability;
                const dayAvl = availability.filter(
                    (avlInfo) =>
                        avlInfo.day.toLowerCase() === dayOfWeek.toLowerCase()
                );
                return dayAvl;
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                console.error("XMLHttpRequest", XMLHttpRequest);
                console.error("textStatus", textStatus);
                console.error("errorThrown", errorThrown);
            },
        });
    }

    var mentorId = window.location.pathname.split("/").slice(-1);

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
})(jQuery);
