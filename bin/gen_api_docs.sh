#!/usr/bin/env bash

source $(dirname $0)/_head.sh

assure_npm
assure_esdoc

ESDOC_CFG_TPL='{"index": "{readme}","source": "{src}","destination": "{dest}","includes": ["\\.(js|es6)$"],"title": "{title}", "package": "{pkg}"}'

DOCS_BASEPATH=${path}/../docs-api

for lib in ${path}/../src/deep-*/; do
  name=$(basename ${lib})
  lib=$(cd ${lib}; pwd -P)

  lib_path=$(escape_sed ${lib}/lib)
  raw_docs_path=${DOCS_BASEPATH}/${name}
  docs_path=$(escape_sed ${raw_docs_path})
  npm_pkg=$(escape_sed ${lib}/package.json)
  readme=$(escape_sed ${lib}/README.md)
  pck_name=$(node -e "console.log(require('$npm_pkg').description)")

  sed "1s/.*/$pck_name ($name)/" ${path}/../README.md > ${lib}/README.md

  if [ ${name} != 'deep-framework' ]; then
    tmp_esdoc_cfg=$(mktemp)
    esdoc_cfg=$(echo ${ESDOC_CFG_TPL} | sed "s/{src}/$lib_path/" | sed "s/{dest}/$docs_path/" | sed "s/{title}/$pck_name/" | sed "s/{pkg}/$npm_pkg/" | sed "s/{readme}/$readme/")

    echo ${esdoc_cfg} > ${tmp_esdoc_cfg}

    ${esdoc} -c ${tmp_esdoc_cfg}
  fi
done
