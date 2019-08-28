/* eslint-disable no-sync */
import {JavaScript, Task, TaskMeta, TaskRoot, TaskSaved} from "../src/main";
import assert from "assert";
import fs from "fs";

(async () => {
  const root = await TaskRoot.create();
  new Task(root, {}, null);
  new JavaScript(root, {
    script: "require('fs').writeFileSync('/test1.txt', 'hello1')"
  }, null);
  await root.run();

  const taskSaved1: TaskSaved = {
    components: [
      {
        "JavaScript - @codesweets/core": {
          script: "console.log('hello world')"
        },
        "qualifiedName": "JavaScript - @codesweets/core"
      }
    ],
    qualifiedName: "TaskRoot - @codesweets/core"
  };
  const deserializedRoot = Task.deserialize(taskSaved1);
  const taskSaved2 = deserializedRoot.serialize();
  assert.deepEqual(taskSaved1, taskSaved2);
  fs.writeFileSync("/test2.txt", "hello2");
  fs.writeFileSync("/test3.txt", "hello3");
  assert.deepEqual(fs.readFileSync("/test1.txt", "utf8"), "hello1");
  assert.deepEqual(fs.readFileSync("/test2.txt", "utf8"), "hello2");
  assert.deepEqual(fs.readFileSync("/test3.txt", "utf8"), "hello3");
  const parsedQn = TaskMeta.parseQualifiedName(Task.meta.qualifiedName);
  assert.deepEqual(typeof parsedQn.module, "string");
  assert.deepEqual(typeof parsedQn.typename, "string");
  assert.deepEqual(TaskMeta.toQualifiedName(parsedQn), Task.meta.qualifiedName);
  console.log("Completed");
})();
