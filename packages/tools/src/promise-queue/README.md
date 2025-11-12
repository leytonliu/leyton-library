## PromiseQueue

一个有限并发的 Promise 任务队列。

### 使用

```ts
import { PromiseQueue } from 'leyton-library';

const tasks = Array.from({ length: 5 }, (_, i) => () =>
  new Promise((resolve) => setTimeout(() => resolve(i), 500))
);
const pq = new PromiseQueue(tasks, 2);
pq.run();
```

