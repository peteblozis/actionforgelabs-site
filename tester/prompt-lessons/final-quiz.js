"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("quiz");
  const score = document.getElementById("score");
  const answers = document.getElementById("answers");
  if (!form || !score || !answers) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const questions = Array.from(form.querySelectorAll("fieldset[data-answer]"));
    const unanswered = questions.filter((question) => !question.querySelector('input[type="radio"]:checked'));
    if (unanswered.length) {
      score.textContent = "Please answer all eight questions before checking your score.";
      unanswered[0].querySelector("input").focus();
      return;
    }
    const correct = questions.filter((question) => question.querySelector('input[type="radio"]:checked').value === question.dataset.answer).length;
    score.textContent = "You answered " + correct + " of " + questions.length + " correctly. Review the explanations below, then try again if you like.";
    answers.open = true;
  });
});
