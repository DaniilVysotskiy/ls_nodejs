const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

let srcFolder = process.argv[2] || null;
let destFolder = process.argv[3] || null;
let isRemove = process.argv[4] === 'true' ? true : false || false;
let filesArr = [];

function ask (question, validate, callback) {
  const stdin = process.stdin;
  const stdout = process.stdout;

  stdin.resume();
  stdout.write(`${question}: `);

  stdin.once('data', data => {
    data = data.toString().trim();

    if (validate.test(data)) {
      callback(data);
    } else {
      stdout.write(`It should match: ${validate}\n`);
      ask(question, validate, callback);
    }
  });
}

function initProcess (src, dest, remove) {
  ensureDir(src, false, () => {
    ensureDir(dest, true, () => {
      console.log('Reading source folder...');
      console.log('========================');
      parseFolder(src, 0);
      console.log('========================');
      console.log('Reading source folder - DONE');

      sortFilesByExtension(filesArr, () => {
        if (remove) {
          removeFolder(remove);
        } else {
          process.exit();
        }
      });
    });
  });
}

const ensureDir = (path, createDir, callback) => {
  console.log(`Checking folder: '${path}'...`);

  if (!fs.existsSync(path)) {
    if (createDir) {
      fs.mkdirSync(path);
    } else {
      console.error(`ERROR: Specified folder ${path} not found! Please, make sure you've passed right path or try another one.`);
      process.exit(1);
    }
  }

  console.log(`Folder '${path}' - OK`);

  if (typeof callback === 'function') {
    callback();
  }
};

const parseFolder = (folder, level) => {
  const items = fs.readdirSync(folder);

  items.forEach(itemName => {
    let pathToItem = path.join(folder, itemName);
    let state = fs.statSync(pathToItem);

    if (state.isDirectory()) {
      console.log(' '.repeat(level) + 'Dir: ' + itemName);
      parseFolder(pathToItem, level + 1);
    } else {
      console.log(' '.repeat(level) + 'File: ' + itemName);
      filesArr.push(pathToItem);
    }
  });
};

const sortFilesByExtension = (filesArr, callback) => {
  if (!filesArr.length) {
    console.log('No files found. Exiting...');
    return;
  }
  console.log('Sorting files by extension...');

  filesArr.forEach(file => {
    const fileObj = path.parse(file);
    const folderExtensionName = fileObj.ext.length ? fileObj.ext.substr(1) : 'other';
    const copyPath = path.join(destFolder, folderExtensionName);
    const copyFile = path.join(copyPath, fileObj.base);

    if (!fs.existsSync(copyPath)) {
      fs.mkdirSync(copyPath);
    }

    fs.copyFileSync(file, copyFile);
  });

  console.log(`Sorting files by extension - DONE.\nSorted files in folder: ${destFolder}`);

  if (typeof callback === 'function') {
    callback();
  }
};

const removeFolder = status => {
  if (status) {
    console.log(`Deleting source folder '${srcFolder}'...`);
    rimraf(srcFolder, () => {
      console.log(`Source folder '${srcFolder}' - DELETED`);
      process.exit();
    });
  }
};

if (!srcFolder && !destFolder) {
  ask('Write source folder', /.+/, src => {
    srcFolder = src;

    ask('Write destination folder', /.+/, dest => {
      destFolder = dest;

      ask('Remove source folder? [y/n]', /[y|n]/i, remove => {
        isRemove = remove.toLowerCase() === 'y';

        initProcess(srcFolder, destFolder, isRemove);
      });
    });
  });
} else {
  initProcess(srcFolder, destFolder, isRemove);
}
