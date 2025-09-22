class PromiseQueue {
    constructor(queue, limit) {
        Object.defineProperty(this, "queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "limit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "result", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "current", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "running", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.queue = queue;
        this.limit = limit;
        this.result = [];
        this.current = 0;
        this.running = 0;
    }
    runNext() {
        if (this.current >= this.queue.length && this.running === 0) {
            console.log('队列已清空，结果：', this.result);
            return;
        }
        if (this.running >= this.limit || this.current >= this.queue.length) {
            return;
        }
        const index = this.current;
        const task = this.queue[this.current];
        this.current++;
        this.running++;
        console.log(`执行第 ${index + 1} 个任务，当前并发数: ${this.running}`);
        task()
            .then((res) => {
            this.result[index] = res;
        })
            .catch((err) => {
            this.result[index] = err;
        })
            .finally(() => {
            this.running--;
            this.runNext();
        });
        this.runNext();
    }
    run() {
        this.runNext();
    }
}
export { PromiseQueue };
export default PromiseQueue;
