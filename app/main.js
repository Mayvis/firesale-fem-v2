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
  const files = dialog.showOpenDialog({
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

const openFile = (filePath) => {
  const content = fs.readFileSync(filePath).toString();

	// emit information to IPC (Interprocess communication)
  mainWindow.webContents.send("file-opened", filePath, content);
};
