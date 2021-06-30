const { app, BrowserWindow, dialog } = require("electron");
const fs = require("fs");

let mainWindow = null;

app.on("ready", () => {
  mainWindow = new BrowserWindow();
  mainWindow.loadFile(`${__dirname}/index.html`);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
});

exports.getFileFromUser = () => {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    // buttonLabel: "Unveil",
    // title: "Open Fire Sale Document",
    filters: [
      { name: "Markdown Files", extensions: ["md", "markdown"] },
      { name: "Text Files", extensions: ["txt", "text"] },
    ],
  });

  // handle files is undefined situation
  if (!files) return;

  const file = files[0];

  openFile(file);
};

exports.saveMarkdown = (filePath, content) => {
  // filePath will be null
  if (!filePath) {
    filePath = dialog.showSaveDialog(mainWindow, {
      title: "Save Markdown",
      defaultPath: app.getPath("desktop"),
      filters: [{ name: "Markdown Files", extensions: ["md", "markdown"] }],
    });
  }

  // handle the situation, if user didn't click save, the file path will still be null
  if (!filePath) return;

  fs.writeFileSync(filePath, content);

  openFile(filePath);
};

exports.saveHTML = (content) => {
  const file = dialog.showSaveDialog(mainWindow, {
    title: "Save HTML",
    defaultPath: app.getPath("desktop"),
    filters: [{ name: "HTML Files", extensions: ["html"] }],
  });

  if (!file) return;

  fs.writeFileSync(file, content);
};

const openFile = (exports.openFile = (filePath) => {
  const content = fs.readFileSync(filePath).toString();

  app.addRecentDocument(filePath);

  // emit information to IPC (Interprocess communication)
  mainWindow.webContents.send("file-opened", filePath, content);
});
