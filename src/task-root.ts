import {Task} from "./task";
import {TaskMeta} from "./task-meta";
import {TaskWithData} from "./task-with-data";

export interface TaskRootData {
  dryRun?: boolean;
  hideSatisfiedInputs?: boolean;
  hideOptionalInputs?: boolean;
  hideUncommonInputs?: boolean;
}

export class TaskRoot extends TaskWithData<TaskRootData> {
  public static meta: TaskMeta = new TaskMeta({
    construct: TaskRoot,
    hidden: true,
    outputs: [Task],
    schema: require("ts-schema!./task-root.ts?TaskRootData"),
    typename: "TaskRoot"
  })

  public static async create (): Promise<TaskRoot> {
    // We are reserving this API to be async in case we need it.
    return new TaskRoot(null, {dryRun: false}, null);
  }

  public async run () {
    await super.run();
  }
}
