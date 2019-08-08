/* eslint-disable no-sync */
import {TaskRoot, Utility} from "../src/main";
import assert from "assert";
import fs from "fs";

(async () => {
  await TaskRoot.create();
  await fs.writeFileSync("/test1.txt", "hello1");
  await fs.writeFileSync("/test2.txt", "hello2");
  await fs.mkdirSync("/dir");
  await fs.mkdirSync("/dir/test/");
  await fs.writeFileSync("/dir/test/file.txt", "hello3");
  assert.deepEqual(fs.readFileSync("/test1.txt", "utf8"), "hello1");

  assert.deepEqual(Utility.fsMatch("test1.txt", "path"), ["/test1.txt"]);
  assert.deepEqual(Utility.fsMatch("/test1.txt", "path"), ["/test1.txt"]);
  assert.deepEqual(Utility.fsMatch("*1*", "glob"), ["/test1.txt"]);
  assert.deepEqual(Utility.fsMatch("/dir/test/*", "glob"), ["/dir/test/file.txt"]);
  assert.deepEqual(Utility.fsMatch("/dir/**", "glob"), ["/dir/test/file.txt"]);
  assert.deepEqual(Utility.fsMatch("/*.txt", "glob"), [
    "/test1.txt",
    "/test2.txt"
  ]);
  assert.deepEqual(Utility.fsMatch("1", "regex"), ["/test1.txt"]);
  assert.deepEqual(Utility.fsMatch(".*file.*", "regex"), ["/dir/test/file.txt"]);
  assert.deepEqual(Utility.fsMatch("/dir", "regex"), ["/dir/test/file.txt"]);
  assert.deepEqual(Utility.fsMatch("^/[^\\/]*\\.txt", "regex"), [
    "/test1.txt",
    "/test2.txt"
  ]);
})();
