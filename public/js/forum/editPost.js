$(window).on("load", () => {
    const handleFormSubmit = (event) => {
        event.preventDefault();

        const formConstraints = {
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

        const formValidate = validate(editPostForm, formConstraints, {
            format: "flat",
        });

        if (formValidate) {
            alert(formValidate[0]);
            return;
        }
        const formValues = validate.collectFormValues(editPostForm);

        // const apiBaseURL = window.location.origin;

        $.ajax({
            type: "PATCH",
            url: window.location.href,
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

    const editPostForm = $("#edit-post-form");

    editPostForm.on("submit", handleFormSubmit);
});
