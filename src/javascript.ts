import {TaskMeta} from "./task-meta";
import {TaskWithData} from "./task-with-data";

export interface JavaScriptData {
  script: string;
}

export class JavaScript extends TaskWithData<JavaScriptData> {
  public static meta: TaskMeta = new TaskMeta({
    construct: JavaScript,
    inputs: [],
    schema: {
      ...require("ts-schema!./javascript.ts?JavaScriptData"),
      additionalProperties: {
        oneOf: [
          {
            properties: {
              value: {
                type: "string"
              }
            },
            title: "String"
          },
          {
            properties: {
              value: {
                type: "number"
              }
            },
            title: "Number"
          },
          {
            properties: {
              value: {
                type: "integer"
              }
            },
            title: "Integer"
          },
          {
            properties: {
              value: {
                type: "boolean"
              }
            },
            title: "Boolean"
          },
          {
            properties: {
              value: {
                format: "data-url",
                type: "string"
              }
            },
            title: "File"
          }
        ],
        type: "object"
      }
    },
    typename: "JavaScript",
    uiSchema: {
      script: {
        "ui:options": {
          mode: "javascript"
        },
        "ui:widget": "code"
      }
    }
  })

  protected async onAllInitialized () {
    // eslint-disable-next-line no-eval
    const func: (self: JavaScript) => Promise<void> = eval(`(self) => { ${this.data.script} }`);
    return func(this);
  }
}
