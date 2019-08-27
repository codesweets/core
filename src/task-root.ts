import {Task, TaskLog} from "./task";
import {TaskMeta} from "./task-meta";
import {TaskWithData} from "./task-with-data";

export interface TaskRootData {
  dryRun?: boolean;
}

export class TaskRoot extends TaskWithData<TaskRootData> {
  public static meta: TaskMeta = new TaskMeta({
    construct: TaskRoot as any,
    hidden: true,
    outputs: [Task],
    schema: require("ts-schema!./task-root.ts?TaskRootData"),
    typename: "TaskRoot"
  })

  public logger: TaskLog;

  public get logTask (): TaskLog {
    return this.logger || ((task, type, ...args) => console.log(task.meta.typename, type, ...args));
  }

  public static async create (): Promise<TaskRoot> {
    // We are reserving this API to be async in case we need it.
    return new TaskRoot(null, {dryRun: false});
  }

  public async run () {
    await super.run();
  }
}
