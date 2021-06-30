const marked = require("marked");
const path = require("path");
const { remote, ipcRenderer } = require("electron");
const mainProcess = remote.require("./main");
const currentWindow = remote.getCurrentWindow();

let filePath = null;
let originalContent = "";

const markdownView = document.querySelector("#markdown");
const htmlView = document.querySelector("#html");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
const saveMarkdownButton = document.querySelector("#save-markdown");
const revertButton = document.querySelector("#revert");
const saveHtmlButton = document.querySelector("#save-html");
const showFileButton = document.querySelector("#show-file");
const openInDefaultButton = document.querySelector("#open-in-default");

const renderMarkdownToHtml = (markdown) => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

const updateUserInterface = (isEdited) => {
  let title = "Fire Sale";

  if (filePath) {
    title = `${path.basename(filePath)} - ${title}`;

    title += isEdited ? " (Edited)" : "";

    currentWindow.setRepresentedFilename(filePath);
    currentWindow.setDocumentEdited(isEdited);
  }

  saveMarkdownButton.disabled = !isEdited;
  revertButton.disabled = !isEdited;

  currentWindow.setTitle(title);
};

markdownView.addEventListener("keyup", (event) => {
  const currentContent = event.target.value;

  renderMarkdownToHtml(currentContent);

  updateUserInterface(currentContent !== originalContent);
});

openFileButton.addEventListener("click", () => {
  mainProcess.getFileFromUser();
});

saveMarkdownButton.addEventListener("click", () => {
  mainProcess.saveMarkdown(filePath, markdownView.value);
});

saveHtmlButton.addEventListener("click", () => {
  mainProcess.saveHTML(htmlView.innerHTML);
});

window.addEventListener("dragstart", (event) => {
  event.preventDefault();
});
window.addEventListener("dragover", (event) => {
  event.preventDefault();
});
window.addEventListener("dragleave", (event) => {
  event.preventDefault();
});
window.addEventListener("drop", (event) => {
  event.preventDefault();
});

const getDraggedFile = (event) => event.dataTransfer.items[0];
const getDroppedFile = (event) => event.dataTransfer.files[0];
const fileTypeIsSupported = (file) => {
  return ["text/plain", "text/markdown"].includes(file.type);
};

markdownView.addEventListener("dragover", (event) => {
  const file = getDraggedFile(event);

  if (fileTypeIsSupported(file)) {
    markdownView.classList.add("drag-over");
  } else {
    markdownView.classList.add("drag-error");
  }
});
markdownView.addEventListener("dragleave", () => {
  markdownView.classList.remove("drag-over");
  markdownView.classList.remove("drag-error");
});
markdownView.addEventListener("drop", (event) => {
  markdownView.classList.remove("drag-over");
  markdownView.classList.remove("drag-error");

  const file = getDroppedFile(event);

  if (fileTypeIsSupported(file)) {
    mainProcess.openFile(file.path);
  } else {
    alert("That file type is not supported");
  }
});

ipcRenderer.on("file-opened", (event, file, content) => {
  filePath = file;
  originalContent = content;

  markdownView.value = content;
  renderMarkdownToHtml(content);

  updateUserInterface(false);
});
