set -e
cd test
rm -rf ./bin
tsc
node ./bin/test.js