const { parentPort } = require('worker_threads');

function performTaskA(data) {
  return data.reduce((acc, val) => acc + val, 0);
}

parentPort.on('message', (task) => {
  const taskResult = performTaskA(task.data);
  parentPort.postMessage({ taskResult });
});
