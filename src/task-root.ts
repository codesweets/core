import {Task, TaskLog} from "./task";
import {TaskMeta} from "./task-meta";
import {Volume} from "memfs";

export class TaskRoot extends Task {
  public static meta: TaskMeta = new TaskMeta({
    construct: TaskRoot,
    hidden: true,
    outputs: [Task],
    typename: "TaskRoot"
  })

  private volume = new Volume();

  public logger: TaskLog;

  public get fs () {
    return this.volume;
  }

  public get logTask (): TaskLog {
    return this.logger || ((task, type, ...args) => console.log(task.meta.typename, type, args));
  }

  public constructor () {
    super(null);
  }

  public run () {
    return super.run();
  }
}
