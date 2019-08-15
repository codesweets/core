import * as BrowserFS from "browserfs";
import {Task, TaskLog} from "./task";
import {TaskMeta} from "./task-meta";
import util from "util";

export class TaskRoot extends Task {
  public static meta: TaskMeta = new TaskMeta({
    construct: TaskRoot as any,
    hidden: true,
    outputs: [Task],
    typename: "TaskRoot"
  })

  public logger: TaskLog;

  public get logTask (): TaskLog {
    return this.logger || ((task, type, ...args) => console.log(task.meta.typename, type, ...args));
  }

  private constructor () {
    super(null);
  }

  public static async create (): Promise<TaskRoot> {
    // We are reserving this API to be async in case we need it.
    return new TaskRoot();
  }

  public async run () {
    await super.run();
  }
}
