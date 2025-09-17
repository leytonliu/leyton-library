declare class PromiseQueue {
    queue: (() => Promise<any>)[];
    limit: number;
    result: any[];
    current: number;
    running: number;
    constructor(queue: (() => Promise<any>)[], limit: number);
    runNext(): void;
    run(): void;
}
export { PromiseQueue };
