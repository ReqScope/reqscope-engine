const { parentPort } = require('worker_threads');

function performTaskC(data) {
  return data.reduce((acc, val) => acc + val, 0);
}

parentPort.on('message', (task) => {
  const taskResult = performTaskC(task.data);
  parentPort.postMessage({ taskResult });
});
