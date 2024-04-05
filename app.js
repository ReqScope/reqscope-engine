const DynamicThreadPool = require('./DynamicThreadPool');

const poolSize = 2;
const threadPool = new DynamicThreadPool(poolSize);

const tasks = [
  { type: 'A', data: [1, 2, 3] },
  { type: 'B', data: [4, 5, 6] },
  { type: 'C', data: [7, 8, 9] },
  { type: 'A', data: [10, 11, 12] }
];

for(let i=0; i<tasks.length; i++) {
  let p = threadPool.calculate(tasks[i].type, tasks[i].data);

  p.then((res)=> {
    console.log('Result ->' + res);
  });
}
