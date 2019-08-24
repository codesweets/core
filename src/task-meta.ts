import Ajv from "ajv";
import {EventEmitter} from "events";
import {JSONSchema6} from "json-schema";

const ajv = new Ajv({
  unknownFormats: "ignore"
});

type Task = import("./task").Task;
type TaskData = import("./task").TaskData;
export interface QualifiedName { module: string; typename: string }
export type TaskConstructor = (new (owner: Task, data: TaskData) => Task) & { meta: TaskMeta }

export interface TaskMetaInit {
  typename: string;
  construct: TaskConstructor;
  schema? : JSONSchema6;
  schemaTransform?: (schema: JSONSchema6) => void;
  uiSchema? : Record<string, any>;
  inputs? : TaskConstructor[];
  outputs? : TaskConstructor[];
  hidden? : boolean;
}

export class TaskMeta extends EventEmitter implements QualifiedName {
  public readonly typename: string;

  public readonly construct: TaskConstructor;

  public readonly schema: JSONSchema6;

  public readonly uiSchema: any;

  public readonly inputs: TaskConstructor[] = [];

  public readonly outputs: TaskConstructor[] = [];

  public readonly validate: (data: any) => string | null;

  public readonly hidden: boolean;

  public static loaded: TaskMeta[] = [];

  public static loadedByName: Record<string, TaskMeta> = {}

  public readonly module: string;

  public static qualifierSeparator = " - ";

  public readonly qualifiedName: string;

  public constructor (init: TaskMetaInit) {
    super();
    this.module = (window as any).currentModule;
    this.typename = init.typename;
    this.qualifiedName = TaskMeta.toQualifiedName(this);
    this.construct = init.construct;
    if (!init.construct) {
      throw new Error("Parameter 'construct' is required and must " +
        "be the constructor for the class it represents");
    }

    if (init.schema && !init.schema.title) {
      init.schema.title = "";
    }
    this.schema = init.schema || {};

    if (init.schemaTransform) {
      init.schemaTransform(this.schema);
    }

    this.uiSchema = init.uiSchema || {};
    this.inputs = init.inputs || [];
    this.outputs = init.outputs || [];
    const ajvValidate = ajv.compile(this.schema);
    this.validate = (data) => ajvValidate(data) ? null : ajv.errorsText(ajvValidate.errors);
    this.hidden = init.hidden;

    const globals: any = global;
    if (globals.ontaskmeta) {
      TaskMeta.loaded.push(this);
      TaskMeta.loadedByName[this.typename] = this;
      globals.ontaskmeta(this);
    }
  }

  public static toQualifiedName (qualifiedName: QualifiedName): string {
    return `${qualifiedName.typename}${TaskMeta.qualifierSeparator}${qualifiedName.module}`;
  }

  public static parseQualifiedName (qualifiedName: string): QualifiedName {
    const split = qualifiedName.split(TaskMeta.qualifierSeparator);
    return {
      module: split[1],
      typename: split[0]
    };
  }
}
