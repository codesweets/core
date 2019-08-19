import "process";
import {EventEmitter} from "events";
import {TaskMeta} from "./task-meta";

type TaskRoot = import("./task-root").TaskRoot;

export type TaskData = Record<string, any>

export interface TaskSaved {
  typename: string;
  data?: TaskData;
  components?: TaskSaved[];
}

export type TaskLogType = "info" | "error";
export type TaskLog = (task: Task, type: TaskLogType, ...args: any[]) => any;
export type TaskLogger = (type: TaskLogType, ...args: any[]) => any;

export class Task extends EventEmitter {
  public static meta: TaskMeta = new TaskMeta({
    construct: Task,
    hidden: true,
    outputs: [Task],
    typename: "Task"
  })

  public readonly root: TaskRoot;

  public readonly owner: Task;

  public readonly ownerIndex: number;

  public readonly dependencies: Task[] = [];

  public readonly dependents: Task[] = [];

  public readonly components: Task[] = [];

  public readonly rawData: TaskData;

  public id: number = -1;

  private phase: "constructed" | "initialized" = "constructed";

  public get log (): TaskLogger {
    return (type, ...args) => this.root.logTask(this, type, ...args);
  }

  public constructor (owner: Task, data: TaskData = {}) {
    super();

    this.root = owner ? owner.root : this as Task as TaskRoot;
    this.rawData = data;
    this.owner = owner;
    this.ownerIndex = owner ? owner.components.length : -1;

    this.log("info", "Constructed");

    // Perform all validation first before we do any side effects on other tasks.
    const errors = this.meta.validate(data);
    if (errors) {
      throw new Error(errors);
    }

    if (owner) {
      owner.ensure(this.meta);
      owner.components.push(this);
    }
  }

  public get meta (): TaskMeta {
    const {meta} = this.constructor as any;
    if (this.constructor !== meta.construct) {
      throw new Error("Invalid TaskMeta, be sure to use: " +
        "static meta : TaskMeta = new TaskMeta(...)");
    }
    return meta;
  }

  public get catch () {
    return (err: any) => {
      this.log("error", err);
    };
  }

  public static deserialize (object: TaskSaved, owner: Task = null): Task {
    console.log(TaskMeta.loadedByName);
    console.log(object);
    const meta = TaskMeta.loadedByName[object.typename || "TaskRoot"];
    // eslint-disable-next-line new-cap
    const task = new meta.construct(owner, object[object.typename]);
    if (object.components) {
      object.components.forEach((saved) => Task.deserialize(saved, task));
    }
    return task;
  }

  public serialize (): TaskSaved {
    if (this.phase !== "constructed") {
      throw Error(`Only serialize a task when constructed (task was '${this.phase}')`);
    }
    const result: TaskSaved = {
      typename: this.meta.typename
    };
    if (Object.values(this.rawData).length !== 0) {
      result.data = this.rawData;
    }
    if (this.components.length !== 0) {
      result.components = this.components.map((component) => component.serialize());
    }
    return result;
  }

  public static isA (derived: Function, base: Function): boolean {
    let type = derived;
    while (type) {
      if (type === base) {
        return true;
      }
      type = Object.getPrototypeOf(type);
    }
    return false;
  }

  private ensure (meta: TaskMeta): void {
    if (!this.meta.outputs.find((func) => Task.isA(meta.construct, func))) {
      throw new Error(`${meta.typename} is not an output of ${this.meta.typename}`);
    }
  }

  public has<T extends Task = Task> (base: Function, index?: number): T {
    if (Task.isA(this.constructor, base)) {
      return this as Task as T;
    }

    // Find the first component above this index (dependency order) that is closest to the index.
    const nearest = this.components.slice(0, index).reverse();
    for (const component of nearest) {
      if (Task.isA(component.constructor, base)) {
        return component as T;
      }
      const child = component.has(base);
      if (child) {
        return child as T;
      }
    }
    return null;
  }

  public findAbove<T extends Task = Task> (base: Function): T {
    if (!this.owner) {
      return null;
    }
    const component = this.owner.has<T>(base, this.ownerIndex);
    return component ? component : this.owner.findAbove<T>(base);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty-function
  protected async onInitialize (...args: any[]) {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty-function
  protected async onAllInitialized (...args: any[]) {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty-function
  protected async onDestroy (...args: any[]) {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty-function
  protected async onAllDestroyed (...args: any[]) {
  }

  private async walk (func: string, visitor: (component: Task) => Promise<any>) {
    for (const component of this.components) {
      component.log("info", `Begin ${func}`);
      try {
        await visitor(component);
      } catch (err) {
        if (err.message !== "abort") {
          component.log("error", err);
        }
        throw new Error("abort");
      }
      await component.walk(func, visitor);
      component.log("info", `End ${func}`);
    }
  }

  private async initialize () {
    let idCounter = 0;
    await this.walk("initialize", async (component) => {
      component.id = idCounter++;
      const {inputs, typename} = component.meta;

      for (const input of inputs) {
        const dependency = component.findAbove(input);
        if (!dependency) {
          throw new Error(`Missing dependency ${input.meta.typename} in task ${typename}`);
        }
        component.dependencies.push(dependency);
        dependency.dependents.push(this);
      }

      await component.onInitialize(...component.dependencies);
      component.phase = "initialized";
    });
  }

  private async allInitialized () {
    await this.walk("allInitialized", (component) => component.onAllInitialized());
  }

  private async destroy () {
    await this.walk("destroy", (component) => component.onDestroy());
  }

  private async allDestroyed () {
    await this.walk("allDestroyed", (component) => component.onAllDestroyed());
  }

  protected async run () {
    try {
      await this.initialize();
      await this.allInitialized();
      await this.destroy();
      await this.allDestroyed();
    } catch (err) {
      if (err.message !== "abort") {
        throw err;
      }
    }
  }
}
