const path = require('path');
const fs = require('fs-extra');

let srcFolder = process.argv[2] || null;
let destFolder = process.argv[3] || null;
let isRemove = process.argv[4] === 'true' ? true : false || false;

function ask (question, validate) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdin.resume();
    stdout.write(`${question}: `);

    stdin.once('data', data => {
      data = data.toString().trim();

      if (validate.test(data)) {
        resolve(data);
      } else {
        stdout.write(`It should match: ${validate}\n`);
        resolve(ask(question, validate));
      }
    });
  });
}

async function initProcess (src, dest, remove) {
  try {
    await ensureDir(src);
    await ensureDir(dest, true);
    const itemList = await readDirRecursive(src);
    console.log('Reading source folder - DONE');
    await sortFilesByExtension(itemList);
    if (remove) {
      await removeFolder(src);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error(error);
  }
}

async function askProcess () {
  try {
    srcFolder = await ask('Write source folder', /.+/);
    await ensureDir(srcFolder);
    destFolder = await ask('Write destination folder', /.+/);
    await ensureDir(destFolder, true);
    isRemove = await ask('Remove source folder? [y/n]', /[y|n]/i);
    isRemove = isRemove === 'y';
    const itemList = await readDirRecursive(srcFolder);
    console.log('Reading source folder - DONE');
    await sortFilesByExtension(itemList);
    if (isRemove) {
      await removeFolder(srcFolder);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error(error);
  }
}

const ensureDir = (path, createDir) => {
  return new Promise((resolve, reject) => {
    fs.pathExists(path).then(exists => {
      if (!exists) {
        if (createDir) {
          fs.ensureDir(path).then(() => {
            console.log(`Folder '${path}' - OK`);
            resolve();
          });
        } else {
          console.error(`Specified folder ${path} not found!`);
          process.exit(1);
        }
      } else {
        console.log(`Folder '${path}' - OK`);
        resolve();
      }
    });
  });
};

const readDirRecursive = startDir => {
  let readDirQueue = [];
  let fileList = [];

  console.log('Start reading source folder...');

  function readDir(dir) {
    function getItemList(readDir) {
      return new Promise((resolve, reject) => {
        fs.readdir(readDir).then(itemList => {
          resolve(itemList.map(item => path.resolve(readDir, item)));
        });
      });
    }

    function getItemListStat(itemList) {
      function getStat(itemPath) {
        return new Promise((resolve, reject) => {
          fs.stat(itemPath).then(stat => {
            resolve({itemPath, isDirectory: stat.isDirectory()});
          });
        });
      }
      return Promise.all(itemList.map(getStat));
    }

    function processItemList(itemList) {
      for (let {itemPath, isDirectory} of itemList) {
        if (isDirectory) {
          readDirQueue.push(itemPath);
          continue;
        }
        fileList.push(itemPath);
      }
      if (readDirQueue.length > 0) {
        return readDir(readDirQueue.shift());
      }
      return fileList;
    }
    return getItemList(dir)
      .then(getItemListStat)
      .then(processItemList);
  }

  return readDir(startDir);
};

const sortFilesByExtension = (filesArr) => {
  return new Promise ((resolve, reject) => {
    let copyFileQueue = [];

    if (!filesArr.length) {
      reject(new Error('No files found. Exiting...'));
    }

    console.log('Sorting files by extension...');

    filesArr.forEach(file => {
      const fileObj = path.parse(file);
      const folderExtensionName = fileObj.ext.length ? fileObj.ext.substr(1) : 'other';
      const copyPath = path.join(destFolder, folderExtensionName);
      const copyFile = path.join(copyPath, fileObj.base);

      copyFileQueue.push(fs.copy(file, copyFile));
    });

    return Promise.all(copyFileQueue).then(() => {
      console.log(`Sorting files by extension - DONE\nSorted files in folder: ${destFolder}`);
      resolve();
    });
  });
};

const removeFolder = status => {
  if (status) {
    console.log(`Deleting source folder '${srcFolder}'...`);
    fs.remove(srcFolder).then(() => {
      console.log(`Source folder '${srcFolder}' - DELETED`);
      process.exit();
    });
  }
};

if (!srcFolder && !destFolder) {
  askProcess();
} else {
  initProcess(srcFolder, destFolder, isRemove);
}
