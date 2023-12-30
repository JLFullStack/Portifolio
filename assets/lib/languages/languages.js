(function () {
    "use strict";

    const
        q = (seletor) => document.querySelector(seletor),
        qa = (seletor) => document.querySelectorAll(seletor);

    const setLanguageActive = () => {
        const
            btnPT = q("#btn-pt"),
            btnEN = q("#btn-en");

        btnPT.addEventListener("click", () => {
            btnPT.classList.add("active");
            btnEN.classList.remove("active");
        });

        btnEN.addEventListener("click", () => {
            btnPT.classList.remove("active");
            btnEN.classList.add("active");
        });
    };

    const ChangeLanguage = () => {
        qa(".btn-language").forEach(btn =>
            btn.addEventListener("click", () => {
                const attr = btn.getAttribute("language");

                fetch(`assets/lib/languages/json/${attr}.json`).then((response) => {
                    response.json().then((language) => {
                        // #region presentation

                        language.presentation.map((presentation) => {
                            q("#presentation #salutation").textContent = presentation.salutation;
                            q("#presentation #profession").textContent = presentation.profession;
                            q("#presentation #description").textContent = presentation.description;
                        });

                        // #endregion

                        // #region biography

                        language.biography.map((biography) => {
                            q("#biography article #title").textContent = biography.title;
                            q("#biography article #initial-content").textContent = biography.initialContent;
                            q("#biography article #final-content").textContent = biography.finalContent;

                            biography.personalInformation.map((info) => {
                                q("#biography #personal-information #name").textContent = info.name;
                                q("#biography #personal-information #birthday").innerHTML = info.birthday;
                                q("#biography #personal-information #age").innerHTML = info.age;
                                q("#biography #personal-information #address").innerHTML = info.address;
                                q("#biography #personal-information #phone").textContent = info.phone;
                            });
                        });

                        // #endregion

                        // #region projects

                        language.projects.map((projects) => {
                            q("#projects article .btn-view-work span").textContent = projects.viewWork;

                            const featuredProject = q("#projects article").getAttribute("featuredProject");

                            projects[featuredProject].map((featured) => {
                                q("#projects article .title").textContent = featured.title;
                                q("#projects article .description").textContent = featured.description;
                            });

                            const carouselItems = qa("#projects .carousel .carousel-item");

                            carouselItems.forEach((carouselItem) => {
                                const
                                    projectNumber = carouselItem.getAttribute("Project"),
                                    title = carouselItem.querySelector(".title");

                                projects[projectNumber].map((project) => {
                                    title.textContent = project.title;
                                });
                            });
                        });

                        // #endregion

                        // #region testimonials

                        language.testimonials.map((testimonials) => {
                            q("#testimonials .title").textContent = testimonials.title;

                            const cards = qa("#testimonials .card-group .card");

                            cards.forEach((card) => {
                                const
                                    testimonialNumber = card.getAttribute("testimonial"),
                                    content = card.querySelector(".content"),
                                    personName = card.querySelector(".person-name"),
                                    profession = card.querySelector(".profession");

                                testimonials[testimonialNumber].map((testimonial) => {
                                    content.textContent = testimonial.content;
                                    personName.textContent = testimonial.personName;
                                    profession.textContent = testimonial.profession;
                                });
                            });
                        });

                        // #endregion

                        // #region professional Skills

                        language.professionalSkills.map((Skills) => {
                            q("#professional-skills .title").textContent = Skills.title;
                            q("#professional-skills #database").textContent = Skills.database;

                            Skills.others.map((others) => {
                                q("#professional-skills #others .title").textContent = others.title;
                                q("#professional-skills #others #restApi").textContent = others.restApi;
                                q("#professional-skills #others #microservices").textContent = others.microservices;
                                q("#professional-skills #others #adobe-package").textContent = others.adobePackage;
                                q("#professional-skills #others #office-package").textContent = others.officePackage;
                            });
                        });

                        // #endregion

                        // #region certifications

                        language.certifications.map((certifications) => {
                            q("#certifications .title").textContent = certifications.title;
                        });

                        // #endregion

                        // #region education

                        language.education.map((education) => {
                            q("#education .title").textContent = education.title;

                            const timeline = qa("#education .timeline");

                            timeline.forEach((timeline) => {
                                const
                                    academicEducation = timeline.getAttribute("academicEducation"),
                                    termination = timeline.querySelector(".termination"),
                                    title = timeline.querySelector(".title"),
                                    university = timeline.querySelector(".university");

                                university.textContent = education.university;

                                education[academicEducation].map((academicEducation) => {
                                    termination.textContent = academicEducation.termination;
                                    title.textContent = academicEducation.title;
                                });
                            });
                        });

                        // #endregion

                        // #region experience

                        language.experience.map((experience) => {
                            q("#experience .title").textContent = experience.title;

                            const timeline = qa("#experience .timeline");

                            timeline.forEach((timeline) => {
                                const
                                    experienceNumber = timeline.getAttribute("experience"),
                                    profession = timeline.querySelector(".profession"),
                                    company = timeline.querySelector(".company"),
                                    address = timeline.querySelector(".address"),
                                    description = timeline.querySelector(".description");

                                company.textContent = experience.company;
                                address.textContent = experience.address;

                                experience[experienceNumber].map((experience) => {
                                    profession.textContent = experience.profession;
                                    description.textContent = experience.description;
                                });
                            });
                        });

                        // #endregion

                        // #region finalMessage

                        language.finalMessage.map((finalMessage) => {
                            q("#final-message #invitation").textContent = finalMessage.invitation;
                            q("#final-message #message").textContent = finalMessage.message;
                            q("#final-message #contact").textContent = finalMessage.contact;
                        });

                        // #endregion

                        // #region footer

                        language.footer.map((footer) => {
                            q("footer #portifolio").textContent = footer.portifolio;
                        });

                        // #endregion
                    })
                })
            })
        );
    };

    setLanguageActive();
    ChangeLanguage();
})();