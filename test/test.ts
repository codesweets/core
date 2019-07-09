import {TaskRoot} from "../src/main";
import assert from "assert";

(async () => {
  const root = new TaskRoot();
  await root.fs.promises.writeFile("/test1.txt", "hello1");
  await root.fs.promises.writeFile("/test2.txt", "hello2");
  await root.fs.promises.mkdir("/dir");
  await root.fs.promises.mkdir("/dir/test/");
  await root.fs.promises.writeFile("/dir/test/file.txt", "hello3");

  assert.deepEqual(root.fsMatch("test1.txt", "path"), ["/test1.txt"]);
  assert.deepEqual(root.fsMatch("/test1.txt", "path"), ["/test1.txt"]);
  assert.deepEqual(root.fsMatch("*1*", "glob"), ["/test1.txt"]);
  assert.deepEqual(root.fsMatch("/dir/test/*", "glob"), ["/dir/test/file.txt"]);
  assert.deepEqual(root.fsMatch("/dir/**", "glob"), ["/dir/test/file.txt"]);
  assert.deepEqual(root.fsMatch("1", "regex"), ["/test1.txt"]);
  assert.deepEqual(root.fsMatch(".*file.*", "regex"), ["/dir/test/file.txt"]);
  assert.deepEqual(root.fsMatch("/dir", "regex"), ["/dir/test/file.txt"]);
})();
