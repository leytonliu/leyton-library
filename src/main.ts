import './style.css';
import typescriptLogo from './typescript.svg';
import { setupCounter, sayHello, PromiseQueue } from '../lib';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`;

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);
sayHello();

(() => {
  const queue = Array(10)
    .fill(1)
    .map((_, index) => {
      return () =>
        new Promise((resolve) => {
          const timeout = 10000 * Math.random();
          console.log(`任务 ${index} 开始执行，预计耗时 ${timeout}ms`);
          setTimeout(() => {
            console.log(`任务 ${index} 完成 ✅`);
            resolve({
              timeout,
              index,
            });
          }, timeout);
        });
    });

  const p = new PromiseQueue(queue, 5);
  console.log(p);
  p.run();
})();
