class PromiseQueue {
  queue: (() => Promise<any>)[];
  limit: number;
  result: any[];
  current: number;
  running: number;
  constructor(queue: (() => Promise<any>)[], limit: number) {
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

    // 达到并发限制
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
