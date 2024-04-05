const { Worker } = require('worker_threads');

class DynamicThreadPool {
    constructor(maxSize, idleTime = 10000) { // Default idle time 10 minutes (600000 ms)
        this.maxSize = maxSize;
        this.idleTime = idleTime;
        this.workers = { A: [], B: [], C: [] };
        this.tasks = { A: [], B: [], C: [] };
        this.workerScripts = {
            A: './workerA.js',
            B: './workerB.js',
            C: './workerC.js'
        };
        this.checkIdleWorkers();
    }

    findOrCreateWorker(type) {
        let workerPool = this.workers[type];
        const idleWorker = workerPool.find(w => !w.busy);
        if (idleWorker) {
            return idleWorker;
        }

        if (workerPool.length < this.maxSize) {
            const worker = new Worker(this.workerScripts[type]);
            const workerObj = { worker, busy: false, type, lastActive: Date.now() };


            workerObj.worker.on('message', (message) => {
                this.handleResult(workerObj, message);
            });

            worker.on('error', (err) => console.error(err));
            worker.on('exit', () => console.log('Worker exited.'));
            workerPool.push(workerObj);

            return workerObj;
        }

        return null;
    }

    executeTask(task) {
        const workerObj = this.findOrCreateWorker(task.type);

        if (workerObj) {
            workerObj.busy = true;
            workerObj.lastActive = Date.now(); // Update last active time
            workerObj.worker.postMessage({ action: 'execute', data: task.data });
            workerObj.resolve = task.resolve; // Attach the resolve function directly to the workerObj for later use
        } else {
            this.tasks[task.type].push(task);
        }
    }

    handleResult(workerObj, message) {

        const result = message.taskResult;
        const workerPool = this.workers[workerObj.type];
        const workerIndex = workerPool.findIndex(w => w.busy && w.worker.threadId === workerObj.worker.threadId);

        if (workerIndex !== -1) {
            const mainThreadworkerObj = workerPool[workerIndex];
            mainThreadworkerObj.busy = false;
            mainThreadworkerObj.lastActive = Date.now();
            mainThreadworkerObj.resolve(result);
        } else {
            console.error('Failed to find worker object for result handling.');
        }

    }

    calculate(type, data) {
        return new Promise((mainResolve) => {
            this.executeTask({
                type,
                data,
                resolve: (result) => {
                    mainResolve(result);
                }
            });
        });
    }

    checkIdleWorkers() {
        setInterval(() => {
            const now = Date.now();
            Object.keys(this.workers).forEach((type) => {
                this.workers[type] = this.workers[type].filter(workerObj => {
                    if (!workerObj.busy && now - workerObj.lastActive > this.idleTime) {
                        console.log('terminating worker' + workerObj.type );
                        workerObj.worker.terminate();
                        return false;
                    }
                    return true;
                });
            });
        }, this.idleTime / 2); // Check for idle workers at half the idle threshold
    }
}

module.exports = DynamicThreadPool;
