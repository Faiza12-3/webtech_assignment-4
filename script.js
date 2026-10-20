
const titleInput = document.getElementById("titleInput");


const markdownInput = document.getElementById("markdownInput");

const slideElement = document.getElementById("slide");

const presentationSlide = document.getElementById("presentationSlide");

const counter = document.getElementById("counter");
const presentationCounter =
  document.getElementById("presentationCounter");

const prevBtn = document.getElementById("prevBtn");

const nextBtn = document.getElementById("nextBtn");

const presentationPrev = document.getElementById("presentationPrev");
const presentationNext = document.getElementById("presentationNext");

const presentation = document.getElementById("presentation");
const status = document.getElementById("status");

let slides = [];
let currentSlide = 0;
let savedId = null;

function splitSlides(markdown) {
  return markdown
    .split(/^\s*---\s*$/m)
    .map(slide => slide.trim())
    .filter(slide => slide.length > 0);
}

function renderSlide() {

  slides = splitSlides(markdownInput.value);

  if (slides.length === 0) {
    slides = ["# Empty slide\n\nWrite something in the editor."];
  }

  currentSlide = Math.max(
    0,
    Math.min(currentSlide, slides.length - 1)
  );

  const html = marked.parse(slides[currentSlide]);

  slideElement.innerHTML = html;
  presentationSlide.innerHTML = html;

  const label = `Slide ${currentSlide + 1} / ${slides.length}`;

  counter.textContent = label;
  presentationCounter.textContent = label;

  prevBtn.disabled = currentSlide === 0;
  presentationPrev.disabled = currentSlide === 0;

  nextBtn.disabled = currentSlide === slides.length - 1;
  presentationNext.disabled = currentSlide === slides.length - 1;
}

function goToSlide(direction) {
  currentSlide += direction;
  renderSlide();
}

function getSavedPresentations() {
  try {
    return JSON.parse(
      localStorage.getItem("markdownPresentations")
    ) || [];
  } catch {
    return [];
  }
}

function savePresentation() {
  const title = titleInput.value.trim() || "Untitled";
  const markdown = markdownInput.value;

  const all = getSavedPresentations();

  const id = savedId || String(Date.now());

  const presentationData = {
    id,
    title,
    markdown
  };

  const existingIndex = all.findIndex(item => item.id === id);

  if (existingIndex >= 0) {
    all[existingIndex] = presentationData;
  } else {
    all.push(presentationData);
  }

  localStorage.setItem("markdownPresentations", JSON.stringify(all));

  savedId = id;
  status.textContent = `"${title}" saved successfully.`;
}

function createNewPresentation() {
  if (markdownInput.value.trim() &&
      !confirm("Create a new presentation? Unsaved changes may be lost.")) {
    return;
  }

  titleInput.value = "";

  markdownInput.value = "# My first slide\n\nWrite here.\n\n---\n\n# My second slide\n\nWrite here.";
  savedId = null;
  currentSlide = 0;
  status.textContent = "New presentation created.";
  renderSlide();
}

function loadPresentation(id) {
  const item = getSavedPresentations().find(p => p.id === id);

  if (!item) return;

  savedId = item.id;
  titleInput.value = item.title;
  markdownInput.value = item.markdown;
  currentSlide = 0;

  renderSlide();
  status.textContent = `"${item.title}" loaded.`;
}

// Basic presentation picker using a prompt.
function choosePresentation() {
  const all = getSavedPresentations();

  if (all.length === 0) {
    alert("No saved presentations yet. Save one first.");
    return;
  }

  const choices = all
    .map((item, index) => `${index + 1}. ${item.title}`)
    .join("\n");

  const answer = prompt(
    `Enter a presentation number to edit:\n\n${choices}`
  );

  if (answer === null) return;

  const index = Number(answer) - 1;

  if (Number.isInteger(index) && all[index]) {
    loadPresentation(all[index].id);
  } else {
    alert("Invalid presentation number.");
  }
}

function startPresentation() {
  renderSlide();
  presentation.classList.remove("hidden");
}

function exitPresentation() {
  presentation.classList.add("hidden");
}

// Fullscreen works on the presentation area.
async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await presentation.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    status.textContent = "Fullscreen could not be opened.";
  }
}

markdownInput.addEventListener("input", () => {
  currentSlide = 0;
  renderSlide();
});

prevBtn.addEventListener("click", () => goToSlide(-1));
nextBtn.addEventListener("click", () => goToSlide(1));

presentationPrev.addEventListener("click", () => goToSlide(-1));
presentationNext.addEventListener("click", () => goToSlide(1));

document.getElementById("saveBtn")
  .addEventListener("click", savePresentation);

document.getElementById("newBtn")
  .addEventListener("click", createNewPresentation);

document.getElementById("presentBtn")
  .addEventListener("click", startPresentation);

document.getElementById("exitBtn")
  .addEventListener("click", exitPresentation);

document.getElementById("fullscreenBtn")
  .addEventListener("click", toggleFullscreen);

// Keyboard shortcuts.
document.addEventListener("keydown", event => {
  const isTyping =
    event.target.matches("textarea, input");

  if (event.ctrlKey && event.key.toLowerCase() === "s") {
    event.preventDefault();
    savePresentation();
    return;
  }

  if (event.key === "F11") {
    event.preventDefault();
    toggleFullscreen();
    return;
  }

  if (presentation.classList.contains("hidden")) {
    return;
  }

  if (isTyping) return;

  if (event.key === "ArrowLeft") {
    goToSlide(-1);
  }

  if (event.key === "ArrowRight") {
    goToSlide(1);
  }

  if (event.key === "Escape") {
    exitPresentation();

  }
});

function initialize() {

  const all = getSavedPresentations();

  if (all.length > 0) {

    loadPresentation(all[0].id);

  } else {


    markdownInput.value =

      "# Welcome\n\nThis is your first slide.\n\n---\n\n# Second Slide\n\nEdit this text in Markdown.";
      
    renderSlide();
  }
}

initialize();
