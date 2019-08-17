import {TaskMeta} from "./task-meta";
import {TaskWithData} from "./task-with-data";

export interface JavaScriptData {
  script: string;
}

export class JavaScript extends TaskWithData<JavaScriptData> {
  public static meta: TaskMeta = new TaskMeta({
    construct: JavaScript,
    inputs: [],
    schema: require("ts-schema!./javascript.ts?JavaScriptData"),
    typename: "JavaScript"
  })

  protected async onAllInitialized () {
    // eslint-disable-next-line no-eval
    const func: (self: JavaScript) => Promise<void> = eval(`(self) => { ${this.data.script} }`);
    return func(this);
  }
}
