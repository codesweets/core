import fg from "fast-glob";
import find from "find";
import path from "path";
import stringToRegExp from "string-to-regexp";

export type FileMatch = "path" | "glob" | "regex"

export class Utility {
  public static fsMatch (pathOrPattern: string, type: FileMatch): string[] {
    switch (type) {
      case "path":
        return [path.resolve("/", pathOrPattern)];
      case "glob":
        return fg.sync(pathOrPattern.startsWith("/") ? `.${pathOrPattern}` : pathOrPattern, {
          absolute: true,
          cwd: "/"
        });
      case "regex":
        // eslint-disable-next-line no-sync
        return find.fileSync(stringToRegExp(pathOrPattern), "/");
    }
    throw new Error(`Invalid filesystem find type ${type}`);
  }
}
