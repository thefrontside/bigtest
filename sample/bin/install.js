const { exec } = require('@effection/node');

function install({ cwd, stdio }) {  
  return function*(task){
    let command = process.argv.includes('-Y') || process.argv.includes('-yarn') ? 'yarn' : 'npm';
    let install = exec(`${command} install`, { cwd }).run(task);
    if(stdio === 'inherit'){
      task.spawn(install.stdout.forEach((data) => {
        process.stdout.write(data);
      }));
      task.spawn(install.stderr.forEach((data) => {
        process.stderr.write(data);
      }));
    };
    yield install.expect();
  }
};

module.exports = {
  install
};
