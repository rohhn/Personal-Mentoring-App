$(window).on("load", () => {
    // $(".edit-reply").on("click", (event) => {
    //     const dataset = $(event.target).data();
    //     window.location.href = `${window.location.origin}/forum/post/reply/${dataset.replyId}/edit`;
    // });

    $(".delete-reply").on("click", (event) => {
        $(this).off("click");
        const dataset = $(event.target).data();
        $.ajax({
            type: "DELETE",
            url: `${window.location.origin}/forum/post/${dataset.postId}/reply/${dataset.replyId}`,
            success: function (response) {
                // const postId = response.postId;
                // window.location.href = `${window.location.origin}/forum/${postId}`;
                location.reload();
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                console.error("XMLHttpRequest", XMLHttpRequest);
                console.error("textStatus", textStatus);
                console.error("errorThrown", errorThrown);
                alert(XMLHttpRequest.responseJSON.error || errorThrown);
            },
        });
    });
});
