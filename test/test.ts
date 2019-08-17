/* eslint-disable no-sync */
import {JavaScript, Task, TaskRoot, Utility} from "../src/main";
import assert from "assert";
import fs from "fs";

(async () => {
  const root = await TaskRoot.create();
  new Task(root);
  new JavaScript(root, {
    script: "require('fs').writeFileSync('/test1.txt', 'hello1')"
  });
  await root.run();
  fs.writeFileSync("/test2.txt", "hello2");
  fs.writeFileSync("/test3.txt", "hello3");
  fs.mkdirSync("/dir");
  fs.mkdirSync("/dir/test/");
  fs.writeFileSync("/dir/test/file.txt", "hello3");
  assert.deepEqual(fs.readFileSync("/test1.txt", "utf8"), "hello1");
  assert.deepEqual(fs.readFileSync("/test2.txt", "utf8"), "hello2");
  assert.deepEqual(fs.readFileSync("/test3.txt", "utf8"), "hello3");

  assert.deepEqual(Utility.fsMatch("test1.txt", "path"), ["/test1.txt"]);
  assert.deepEqual(Utility.fsMatch("/test1.txt", "path"), ["/test1.txt"]);
  assert.deepEqual(Utility.fsMatch("*1*", "glob"), ["/test1.txt"]);
  assert.deepEqual(Utility.fsMatch("/dir/test/*", "glob"), ["/dir/test/file.txt"]);
  assert.deepEqual(Utility.fsMatch("/dir/**", "glob"), ["/dir/test/file.txt"]);
  assert.deepEqual(Utility.fsMatch("/*.txt", "glob"), [
    "/test1.txt",
    "/test2.txt",
    "/test3.txt"
  ]);
  assert.deepEqual(Utility.fsMatch("1", "regex"), ["/test1.txt"]);
  assert.deepEqual(Utility.fsMatch(".*file.*", "regex"), ["/dir/test/file.txt"]);
  assert.deepEqual(Utility.fsMatch("/dir", "regex"), ["/dir/test/file.txt"]);
  assert.deepEqual(Utility.fsMatch("^/[^\\/]*\\.txt", "regex"), [
    "/test1.txt",
    "/test2.txt",
    "/test3.txt"
  ]);
  console.log("Completed");
})();
