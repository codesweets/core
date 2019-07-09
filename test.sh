set -e
cd test
rm -rf ./bin
rm -rf ./node_modules
mkdir -p ./node_modules/@codesweets
ln -s "../../../" "./node_modules/@codesweets/core"
tsc
node ./bin/test.js