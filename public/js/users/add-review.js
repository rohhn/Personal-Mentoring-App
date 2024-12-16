$(window).on("load", () => {
    const reviewFormReset = () => {
        const reviewForm = $("#review-form");
        reviewForm[0].reset();
    };

    const triggerToast = (content, type = undefined) => {
        const alertToast = $("#alert-toast");
        $("#toast-content").text(content);

        alertToast.removeClass();

        if (type === "error") {
            alertToast.addClass("text-bg-danger toast");
        } else if (type === "info") {
            alertToast.addClass("text-bg-info toast");
        } else {
            alertToast.addClass("text-bg-dark toast");
        }
        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(alertToast);

        toastBootstrap.show();
    };

    const openReviewModal = (event) => {
        // const { sessionId, mentorId, menteeId } = $(event.target).data();
        reviewModalEle.data($(event.target).data());

        reviewFormReset();
        reviewModalObj.show();
    };

    const handleSubmitForm = (event) => {
        event.preventDefault();
        const modalData = $("#reviewModal").data();
        // console.log(modalData);
        const formValues = validate.collectFormValues(event.target);
        // console.log(formValues);

        const apiBaseURL = window.location.origin;
        const apiURL = `${apiBaseURL}/ratings/addRating`;

        if (formValues.userType === "mentee") {
            formValues.userId = modalData.mentorId;
        } else if (formValues.userType === "mentor") {
            formValues.userId = modalData.menteeId;
        }

        formValues.sessionId = modalData.sessionId;
        formValues.rating = parseInt(formValues.rating);

        const formConstraints = {
            review: {
                presence: {
                    allowEmpty: false,
                },
                type: "string",
                length: {
                    minimum: 25,
                    maximum: 200,
                },
            },
            rating: {
                presence: {
                    allowEmpty: false,
                },
                numericality: {
                    onlyInteger: true,
                    strict: true,
                    greaterThan: 1,
                    lessThanOrEqualTo: 5,
                },
            },
        };

        const formValidate = validate(formValues, formConstraints, {
            format: "flat",
        });

        if (formValidate) {
            console.error(formValidate[0]);
            alert(formValidate[0]);
            return;
        }

        $.ajax({
            type: "POST",
            url: apiURL,
            data: formValues,
            dataType: "json",
            success: function (response) {
                reviewModalObj.hide();
                triggerToast("Review submitted!", "info");
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                console.error("XMLHttpRequest", XMLHttpRequest);
                console.error("textStatus", textStatus);
                console.error("errorThrown", errorThrown);

                reviewModalObj.hide();
                triggerToast(
                    XMLHttpRequest.responseJSON.error ||
                        "An error occured! Couldn't submit your review.",
                    "error"
                );
            },
        });
    };

    const reviewForm = $("#review-form");
    const reviewModalObj = new bootstrap.Modal("#reviewModal");
    const reviewModalEle = $("#reviewModal");

    reviewForm.on("submit", handleSubmitForm);

    $(".review-btn").each(function () {
        $(this).on(
            "click",
            // { session_id: window.location.href.split("/").slice(-1) },
            openReviewModal
        );
    });
});
