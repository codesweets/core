set -e
cd test
rm -rf ./bin
codesweets build
codesweets run --script=./bin/test.js