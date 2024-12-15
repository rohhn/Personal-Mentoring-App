$(window).on("load", () => {
    $(".edit-post").on("click", (event) => {
        const dataset = $(event.target).data();
        window.location.href = `${window.location.origin}/forum/post/${dataset.postId}/edit`;
    });

    $(".delete-post").on("click", (event) => {
        $(this).off("click");
        const dataset = $(event.target).data();
        $.ajax({
            type: "DELETE",
            url: `${window.location.origin}/forum/post/${dataset.postId}`,
            success: function (response) {
                const forumId = response.forumId;
                window.location.href = `${window.location.origin}/forum/${forumId}`;
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
