$(window).on("load", () => {
    const handleFormSubmit = (event) => {
        event.preventDefault();

        const formConstraints = {
            forum_id: {
                presence: {
                    allowEmpty: false,
                },
                type: "string",
            },
            title: {
                presence: {
                    allowEmpty: false,
                },
                type: "string",
                length: {
                    minimum: 5,
                    maximum: 75,
                },
            },
            content: {
                presence: {
                    allowEmpty: false,
                },
                type: "string",
                length: {
                    minimum: 50,
                },
            },
        };

        const formValidate = validate(makePostForm, formConstraints, {
            format: "flat",
        });

        if (formValidate) {
            alert(formValidate[0]);
            return;
        }
        const formValues = validate.collectFormValues(makePostForm);

        const apiBaseURL = window.location.origin;

        $.ajax({
            type: "POST",
            url: window.location.href, //`${apiBaseURL}/forum/${formValues.forum_id}`,
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify(formValues),
            success: function (response) {
                console.log("response ", response);
                const postId = response.postId;
                window.location.href = `${window.location.origin}/forum/post/${postId}`;
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                console.error("XMLHttpRequest", XMLHttpRequest);
                console.error("textStatus", textStatus);
                console.error("errorThrown", errorThrown);
                alert(XMLHttpRequest.responseJSON.error || errorThrown);
            },
        });
    };

    const makePostForm = $("#make-post-form");

    makePostForm.on("submit", handleFormSubmit);
});
