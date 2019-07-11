set -e
patch-package
mkdir -p './node_modules/@codesweets'
ln -s -f -n '../..' './node_modules/@codesweets/core'