set -e
cd test
rm -rf ./bin
mkdir -p "../node_modules/@codesweets"
ln -s -f -n "../.." "../node_modules/@codesweets/core"
tsc
node ./bin/test.js
unlink "../node_modules/@codesweets/core"