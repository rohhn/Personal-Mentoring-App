$(window).on("load", () => {
    validate.extend(validate.validators.datetime, {
        // The value is guaranteed not to be null or undefined but otherwise it
        // could be anything.
        parse: function (value, options) {
            return +moment.utc(value);
        },
        // Input is a unix timestamp
        format: function (value, options) {
            var format = options.dateOnly
                ? "YYYY-MM-DD"
                : "YYYY-MM-DD hh:mm:ss";
            return moment.utc(value).format(format);
        },
    });

    const loadUserInfo = () => {
        let userInfo = undefined;
        $.ajax({
            type: "GET",
            url: `${apiBaseURL}/mentor/${formDataset.userId}?api=true`,
            async: false,
            success: function (response) {
                userInfo = response;
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                console.error("XMLHttpRequest", XMLHttpRequest);
                console.error("textStatus", textStatus);
                console.error("errorThrown", errorThrown);
                alert(errorThrown);
            },
        });
        return userInfo;
    };

    const fillInitialForm = () => {
        if (userInfo.education) {
            userInfo.education.forEach((edu) => {
                addEducationForm(edu.degree, edu.institution, edu.year);
            });
        }
        if (userInfo.experience) {
            userInfo.experience.forEach((exp) => {
                addExperienceForm(exp.title, exp.institution, exp.years);
            });
        }
    };

    const addEducationForm = (
        degree = undefined,
        institution = undefined,
        year = undefined
    ) => {
        const educationDiv = $("#education-div");
        const newIndex = educationDiv.children().length;
        const eduFormTemplate = `
            <form id="education-form-${newIndex}" onsubmit="return false;">
                <label>Degree:
                    <input
                    class="form-control"
                    type="text"
                    name="degree"
                    value="${degree || ""}"
                    required
                />
                </label>
                <label>
                    Institution:
                    <input
                    class="form-control"
                    type="text"
                    name="institution"
                    value="${institution || ""}"
                    required
                />
                </label>
                <label>
                    Year:<input
                    class="form-control"
                    type="number"
                    min=1960
                    max=${new Date().getFullYear()}
                    name="year"
                    value="${year || ""}"
                    required
                />
                </label>
                <button class="btn btn-sm" type="button" data-action="remove-education" data-index=${newIndex}><i class="fa-solid fa-xmark fa-sm" style="color: #ffffff;"></i></button>
                <hr/>
            </form>`;
        educationDiv.append(eduFormTemplate);
    };

    const removeEducationForm = (index) => {
        const ele = $(`#education-form-${index}`);
        ele.remove();
    };

    const addExperienceForm = (
        title = undefined,
        institution = undefined,
        years = undefined
    ) => {
        const experienceDiv = $("#experience-div");
        const newIndex = experienceDiv.children().length;
        const expFormTemplate = `
        
            <form id="experience-form-${newIndex}" onsubmit="return false;">
                <label>Title:
                    <input
                    class="form-control"
                    type="text"
                    name="title"
                    value="${title || ""}"
                    required
                />
                </label>
                <label>
                    Institution:
                    <input
                    class="form-control"
                    type="text"
                    name="institution"
                    value="${institution || ""}"
                    required
                />
                </label>
                <label>
                    Years of experience:<input
                    class="form-control"
                    type="number"
                    min=0
                    max=30
                    name="years"
                    value="${years || ""}"
                    required
                />
                </label>
                <button class="btn btn-sm" type="button" data-action="remove-experience" data-index=${newIndex}><i class="fa-solid fa-xmark fa-sm" style="color: #ffffff;"></i></button>
                <hr/>
            </form>`;
        experienceDiv.append(expFormTemplate);
    };

    const removeExperienceForm = (index) => {
        const ele = $(`#experience-form-${index}`);
        ele.remove();
    };

    const extractSubjects = () => {
        const parentList = $("#subject-areas-list");
        existingSubjects = $.map(parentList.children(), function (liEle, idx) {
            const subjectName = $(liEle).data("subjectName");
            if (subjectName.trim()) return subjectName;
        });

        return existingSubjects;
    };

    const extractEducation = () => {
        const parentDiv = $("#education-div");
        education = $.map(parentDiv.children(), function (eduForm, idx) {
            const formConstraints = {
                degree: {
                    presence: {
                        allowEmpty: false,
                    },
                    type: "string",
                    length: {
                        minimum: 5,
                        maximum: 40,
                    },
                },
                institution: {
                    presence: {
                        allowEmpty: false,
                    },
                    type: "string",
                    length: {
                        minimum: 5,
                        maximum: 40,
                    },
                },
                year: {
                    presence: {
                        allowEmpty: false,
                    },
                    numericality: {
                        onlyInteger: true,
                        strict: true,
                        greaterThan: 1960,
                        lessThanOrEqualTo: new Date().getFullYear(),
                    },
                },
            };

            eduData = validate.collectFormValues(eduForm);

            const formValidate = validate(eduData, formConstraints, {
                format: "flat",
            });
            if (formValidate) {
                const errorObj = new Error();
                errorObj.message = formValidate[0];
                errorObj.name = "validation_error";
                alert(formValidate[0]);
                throw errorObj;
            }

            return eduData;
        });

        return education;
    };

    const extractExperience = () => {
        const parentDiv = $("#experience-div");
        experience = $.map(parentDiv.children(), function (expForm, idx) {
            const formConstraints = {
                title: {
                    presence: {
                        allowEmpty: false,
                    },
                    type: "string",
                    length: {
                        minimum: 5,
                        maximum: 40,
                    },
                },
                institution: {
                    presence: {
                        allowEmpty: false,
                    },
                    type: "string",
                    length: {
                        minimum: 5,
                        maximum: 40,
                    },
                },
                years: {
                    presence: {
                        allowEmpty: false,
                    },
                    numericality: {
                        onlyInteger: true,
                        strict: true,
                        greaterThanOrEqualTo: 0,
                        lessThanOrEqualTo: 30,
                    },
                },
            };

            expData = validate.collectFormValues(expForm);

            const formValidate = validate(expData, formConstraints, {
                format: "flat",
            });
            if (formValidate) {
                const errorObj = new Error();
                errorObj.message = formValidate[0];
                errorObj.name = "validation_error";
                alert(formValidate[0]);
                throw errorObj;
            }

            return expData;
        });

        return experience;
    };

    const addSubjectArea = () => {
        const inputEle = $("#new-subject-input");
        const value = inputEle.val().trim();
        const parentList = $("#subject-areas-list");
        const index = parentList.children().length;

        if (value) {
            const check = validate(
                { subjects: value },
                {
                    subjects: {
                        exclusion: {
                            within: extractSubjects(),
                            message: "^%{value} is already added!",
                        },
                    },
                },
                { format: "flat" }
            );

            if (check) {
                alert(check[0]);
                return;
            }

            const listEle = `
            <li
                class="list-group-item border-0 p-1 px-2 me-2 badge rounded-pill text-bg-info"
                data-subject-name="${value}" id="subject-li-${index}"
            >${value}<button
                    class="btn-close btn-sm ms-1 remove-subject-btn"
                    type="button"
                    aria-label="close"
                    data-action="remove-subject"
                    data-subject-li="subject-li-${index}"
                    data-subject-name="${value}"
                ></button>
            </li>`;

            parentList.append(listEle);
            inputEle.val("");
        } else {
            inputEle.val("");
            alert("Subject name cannot be empty!");
        }
    };

    const removeSubjectArea = (elemId) => {
        const ele = $(`#${elemId}`);
        ele.remove();
    };

    const updateUser = async (formData) => {
        const apiUrl = `${apiBaseURL}/mentor/${formDataset.userId}`;
        let updateResponse = {};
        $.ajax({
            type: "PUT",
            url: apiUrl,
            data: formData,
            async: false,
            contentType: false,
            processData: false,
            cache: false,
            success: function (response) {
                updateResponse.error = false;
            },
            error: (XMLHttpRequest, textStatus, errorThrown) => {
                console.error("XMLHttpRequest", XMLHttpRequest);
                console.error("textStatus", textStatus);
                console.error("errorThrown", errorThrown);
                updateResponse.error = true;
            },
        });

        return updateResponse;
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        // try {
        //     const subject_areas = extractSubjects();
        //     const education = extractEducation();
        //     const experience = extractExperience();
        // } catch (error) {
        //     alert(error.message);
        //     return;
        // }

        const otherFormValues = validate.collectFormValues(event.target);

        //validate
        const formConstraints = {
            first_name: {
                presence: {
                    allowEmpty: false,
                },
                type: "string",
                length: {
                    minimum: 2,
                    maximum: 15,
                },
            },
            last_name: {
                presence: {
                    allowEmpty: false,
                },
                type: "string",
                length: {
                    minimum: 2,
                    maximum: 20,
                },
            },
            dob: {
                presence: {
                    allowEmpty: false,
                },
                datetime: {
                    dateOnly: true,
                },
            },
            summary: {
                presence: {
                    allowEmpty: false,
                },
                type: "string",
                length: {
                    minimum: 25,
                    maximum: 200,
                },
            },
        };
        const formValidate = validate(otherFormValues, formConstraints, {
            format: "flat",
        });
        if (formValidate) {
            alert(formValidate[0]);
            return;
        } else {
            const formData = new FormData(updateUserForm[0]);

            formData.append("subject_areas", JSON.stringify(extractSubjects()));
            formData.append("education", JSON.stringify(extractEducation()));
            formData.append("experience", JSON.stringify(extractExperience()));

            const response = await updateUser(formData);

            if (response.error) {
                alert("Error updating profile. Please try again.");
            } else {
                window.location.href = `${window.location.origin}/mentor/${formDataset.userId}`;
            }
        }
    };

    const handleClicks = (e) => {
        const clickedBtn = e.currentTarget;

        const action = $(clickedBtn).data("action");

        if (action === "add-education") {
            addEducationForm();
        } else if (action === "remove-education") {
            const index = $(clickedBtn).data("index");
            removeEducationForm(index);
        } else if (action === "add-experience") {
            addExperienceForm();
        } else if (action === "remove-experience") {
            const index = $(clickedBtn).data("index");
            removeExperienceForm(index);
        } else if (action === "remove-subject") {
            const itemToRemove = $(clickedBtn).data("subjectLi");
            removeSubjectArea(itemToRemove);
        } else if (action === "add-subject") {
            addSubjectArea();
        }
    };

    const updateUserForm = $("#update-user-form");
    updateUserForm.on("submit", handleFormSubmit);
    const formDataset = updateUserForm.data(); // {"userId": "67565c95261c64e042226baf"}

    const apiBaseURL = window.location.origin;

    const userInfo = loadUserInfo();
    fillInitialForm();

    $("body").on("click", "button", handleClicks);
});
