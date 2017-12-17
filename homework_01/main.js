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

function initProcess (src, dest, remove) {
  ensureDir(src).then(() => {
    return ensureDir(dest, true);
  }).then(() => {
    return readDirRecursive(src);
  }).then(itemList => {
    console.log(itemList);
    console.log('Reading source folder - DONE');
    return sortFilesByExtension(itemList);
  }).then(() => {
    if (remove) {
      return removeFolder(src);
    } else {
      process.exit(0);
    }
  }).catch(error => {
    console.error(error);
  });
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
          // resolve with parent path added to each item
          resolve(itemList.map(item => path.resolve(readDir, item)));
        });
      });
    }

    function getItemListStat(itemList) {
      function getStat(itemPath) {
        return new Promise((resolve, reject) => {
          fs.stat(itemPath).then(stat => {
            // resolve with item path and if directory
            resolve({itemPath, isDirectory: stat.isDirectory()});
          });
        });
      }
      // stat all items in list
      return Promise.all(itemList.map(getStat));
    }

    function processItemList(itemList) {
      for (let {itemPath, isDirectory} of itemList) {
        // if directory add to queue
        if (isDirectory) {
          readDirQueue.push(itemPath);
          continue;
        }
        // add file to list
        fileList.push(itemPath);
      }
      // if queue, process next item recursive
      if (readDirQueue.length > 0) {
        return readDir(readDirQueue.shift());
      }
      // finished - return file list
      return fileList;
    }
    // read item list from directory, stat each item then walk result
    return getItemList(dir)
      .then(getItemListStat)
      .then(processItemList);
  }

  // commence reading at the top
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
      console.log(`Sorting files by extension - DONE.\nSorted files in folder: ${destFolder}`);
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
  ask('Write source folder', /.+/).then(src => {
    srcFolder = src;
  }).then(() => {
    return ask('Write destination folder', /.+/);
  }).then(dest => {
    destFolder = dest;
  }).then(() => {
    return ask('Remove source folder? [y/n]', /[y|n]/i);
  }).then(remove => {
    isRemove = remove.toLowerCase() === 'y';
  }).then(() => {
    initProcess(srcFolder, destFolder, isRemove);
  }).catch(error => {
    console.error(error);
  });
} else {
  initProcess(srcFolder, destFolder, isRemove);
}
