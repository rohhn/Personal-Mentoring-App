document.addEventListener("DOMContentLoaded", () => {
    const removeSkill = (srcElement) => {
        const parentElement = srcElement.parentElement;
        parentElement.remove();
    };

    const addSkill = (srcElement) => {
        const newSkillInput = document.getElementById("new-skill-input");

        if (newSkillInput.value !== "") {
            const newSkillItem = document.createElement("li");
            "list-group-item border-0 p-1 px-2 me-2 badge rounded-pill text-bg-info bg-transparent"
                .split(" ")
                .forEach((element) => {
                    newSkillItem.classList.add(element);
                });

            newSkillItem.innerHTML = newSkillInput.value;
            newSkillItem.setAttribute("data-skill", newSkillInput.value);

            const removeBtn = document.createElement("button");
            "btn-close btn-sm ms-1 remove-skill-btn".split(" ").forEach((element) => {
                removeBtn.classList.add(element);
            });
            removeBtn.setAttribute("type", "button");
            removeBtn.setAttribute("aria-label", "close");
            removeBtn.setAttribute("data-skill", newSkillInput.value);
            removeBtn.setAttribute("data-action", "remove-skill");

            newSkillItem.appendChild(removeBtn);

            const existingSkillsList = document.getElementById("skills-list");
            existingSkillsList.appendChild(newSkillItem);

            newSkillInput.value = "";
        } else {
            alert("New Skill cannot be empty!");
        }
    };

    const handleClicks = (e) => {
        const clickedBtn = e.srcElement;
        const action = clickedBtn.getAttribute("data-action");

        if (action === "remove-skill") {
            removeSkill(clickedBtn);
        }

        if (action === "add-skill") {
            addSkill(clickedBtn);
        }
    };

    const updateUser = async (formData) => {
        try {
            const response = await fetch(`${window.location.origin}/${formData.user_type}/${formData.user_id}`, {
                method: "PUT",
                body: JSON.stringify(formData),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return response.json();
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    if (document.body.addEventListener) {
        document.body.addEventListener("click", handleClicks, false);
    }

    const updateUserForm = document.getElementById("update-user-form");

    if (updateUserForm) {
        updateUserForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const data = new FormData(updateUserForm);

            const skillsList = document.getElementById("skills-list");
            const newSkillsList = [];
            for (let index = 0; index < skillsList.children.length; index++) {
                newSkillsList.push(skillsList.children[index].getAttribute("data-skill"));
            }

            // data.append("skills", JSON.stringify(newSkillsList));

            if (data.has("profile_image")) {
                // TODO: Make a separate function to handle profile image uploads.
                data.delete("profile_image");
            }

            const payload = {};
            data.forEach((value, key) => (payload[key] = value));
            payload.skills = newSkillsList;

            const completed = await updateUser(payload);
            if (completed) {
                window.location.href = `${window.location.origin}/${payload.user_type}/${payload.user_id}`;
            } else {
                console.log("error");
            }
        });
    }
});
