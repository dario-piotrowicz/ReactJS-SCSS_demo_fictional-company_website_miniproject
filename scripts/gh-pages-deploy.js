const ghpages = require('gh-pages');
const ncp = require('ncp').ncp;
const del = require('del');
const fs = require('fs');
var npm = require('npm');

const consoleError = (message) => {
  console.error('\x1b[31m', message);
  console.error('');
};

const deleteDist = () => {
  del(['dist'])
    .then()
    .catch(() => {
      consoleError('unable to delete temporary dist folder');
    });
};

const publish = () => {
  ghpages.publish('dist', (err) => {
    if (err) {
      consoleError('ghpages was unable to publish dist folder');
    } else {
      deleteDist();
    }
  });
};

const create404File = (result) => {
  fs.writeFile('dist/404.html', result, 'utf8', function (err) {
    if (err) {
      consoleError('Error, unable to write to dist/index.html file');
    } else {
      publish();
    }
  });
};

const updateIndexHtml = () => {
  const githubIoBase = 'https://dario-piotrowicz.github.io';
  const repoName = 'ReactJS-CSS_demo_fictional-company_website_miniproject';

  fs.readFile('dist/index.html', 'utf8', function (err, data) {
    if (err) {
      consoleError('Error, unable to read dist/index.html file');
    }

    let result = data.replace(/src="\//g, `src="${githubIoBase}/${repoName}/`);
    result = result.replace(/href="\//g, `href="${githubIoBase}/${repoName}/`);
    result = result.replace(
      `document.IndexBrowserRouterBasename = '/';`,
      `document.IndexBrowserRouterBasename = "/${repoName}"`
    );

    fs.writeFile('dist/index.html', result, 'utf8', function (err) {
      if (err) {
        consoleError('Error, unable to write to dist/index.html file');
      } else {
        create404File(result);
      }
    });
  });
};

const createDist = () => {
  ncp('public', 'dist', (err) => {
    if (err) {
      consoleError(`Error, unable to create 'dist' folder`);
    } else {
      updateIndexHtml();
    }
  });
};

const build = () => {
  npm.load((err) => {
    if (err) {
      consoleError('Error in loading npm');
    } else {
      npm.commands.run(['build'], (err) => {
        if (err) {
          consoleError(`Error in running 'build' script`);
        } else {
          createDist();
        }
      });
    }
  });
};

if (fs.existsSync('./dist')) {
  consoleError(
    `A folder called 'dist' is present in the root directory,
        this script expects that no such folder exists,
              please remove it and try again`
  );
} else {
  build();
}
