const { parentPort } = require('worker_threads');

function performTaskB(data) {
  return data.reduce((acc, val) => acc + val, 0);
}

parentPort.on('message', (task) => {
  const taskResult = performTaskB(task.data);
  parentPort.postMessage({ taskResult });
});
