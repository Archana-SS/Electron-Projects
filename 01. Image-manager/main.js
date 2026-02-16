const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("node:path");
const fs = require("fs");
const { fileURLToPath } = require("url");

let mainWindow;
let selectedFile = "";

const initialize = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      //preload: require('path').resolve(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile("./index.html");
};

const isMac = process.platform === "darwin";

const template = [
  // { role: 'appMenu' }
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
  // { role: 'fileMenu' }
  {
    label: "File",
    submenu: [
      {
        label: "Select File",
        click: async () => {
          const file = await select_file();
          if (file) {
            selectedFile = file;
            mainWindow.webContents.send("event-from-main-process", file);
          }
        },
      },
      {
        label: "Delete File",
        click: () => {
          if (!selectedFile) return;
          mainWindow.webContents.send("attempt-delete-file", selectedFile);
        },
      },
    ],
  },
  {
    label: "Window",
    submenu: [
      {
        role: "minimize",
        click: () => {
          mainWindow.minimize();
        },
      },

      {
        role: "reload",
      },

      {
        role: "toggleDevTools",
      },
    ],
  },
  {
    role: "help",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          const { shell } = require("electron");
          await shell.openExternal("https://electronjs.org");
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const select_file = async () => {
  const file = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [{ extensions: ["jpg", "png", "jpeg", "gif"] }],
  });
  if (!file.canceled) {
    return file.filePaths[0];
  }
  return null;
};

const delete_file = (filename) => {
  const filePath = fileURLToPath(filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.log("err", err);
      return;
    }
    selectedFile = "";
    mainWindow.webContents.send("file-deleted");
  });
};

app.whenReady().then(() => {
  ipcMain.handle("open-file", async () => {
    const file = await select_file();
    if (file) {
      selectedFile = file;
    }
    return file;
  });

  ipcMain.on("open-contextmenu", (event, data) => {
    const template = [
      {
        label: "Select File",
        click: async () => {
          const file = await select_file();
          if (file) {
            selectedFile = file;
            event.sender.send("event-from-main-process", file);
          }
        },
      },
      {
        type: "separator",
      },
      {
        label: "Delete File",
        click: () => {
          if (data.filename == "") return;
          // delete_file(data.filename)
          mainWindow.webContents.send("attempt-delete-file");
        },
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    menu.popup({
      window: BrowserWindow.fromWebContents(event.sender),
    });
  });

  ipcMain.on("delete-file", (event, data) => {
    console.log("data", data);
    delete_file(data.filename);
  });

  ipcMain.on("request-delete", () => {
    if (!selectedFile) return;
    mainWindow.webContents.send("attempt-delete-file", selectedFile);
  });

  initialize();

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      initialize();
    }
  });
});
