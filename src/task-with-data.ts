import {Task, TaskData} from "./task";

export class TaskWithData<T extends TaskData = TaskData> extends Task {
  public get data (): T {
    return this.rawData as T;
  }

  // eslint-disable-next-line no-useless-constructor
  public constructor (owner: Task, data: T) {
    super(owner, data);
  }
}
