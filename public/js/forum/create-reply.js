$(window).on("load", () => {
    const makeReplyForm = () => {
        const form = `<form id="create-reply-form" class="my-2" onSubmit="handleReplyFormSubmit">
            <div class="input-group mb-3">
                <input
                    type="text"
                    class="form-control"
                    placeholder="Write your reply here..."
                    aria-label="Your Reply:"
                    name="content"
                    required
                />
                <button
                    class="btn btn-primary"
                    type="submit"
                    id="create-reply-btn"
                >Submit Reply</button>
            </div>
        </form>`;
        return form;
    };

    const handleAddReplyBtnClick = (event) => {
        createReplyDiv.empty();

        createReplyDiv.append(makeReplyForm());
        // addReplyButton.prop("disabled", true);
    };

    const handleReplyFormSubmit = (event) => {
        event.preventDefault();

        const formConstraints = {
            content: {
                presence: {
                    allowEmpty: false,
                },
                type: "string",
                length: {
                    minimum: 10,
                },
            },
        };

        const formValidate = validate(event.target, formConstraints, {
            format: "flat",
        });

        if (formValidate) {
            alert(formValidate[0]);
            return;
        }

        const formValues = validate.collectFormValues(createReplyForm);

        $.ajax({
            type: "POST",
            url: `${window.location.href}/reply`,
            headers: {
                "Content-Type": "application/json",
            },
            data: JSON.stringify(formValues),
            success: function (response) {
                location.reload();
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                console.error("XMLHttpRequest", XMLHttpRequest);
                console.error("textStatus", textStatus);
                console.error("errorThrown", errorThrown);
                alert(XMLHttpRequest.responseJSON.error || errorThrown);
            },
        });
    };

    // const createReplyDiv = $("#create-reply-div");
    // const addReplyButton = $(".add-reply-btn");
    const createReplyForm = $("#create-reply-form");
    createReplyForm.off("submit").on("submit", handleReplyFormSubmit);
    // addReplyButton.on("click", handleAddReplyBtnClick);
});
