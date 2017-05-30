#!/usr/bin/env bash

path=$(cd $(dirname $0); pwd -P)
npm=$(which npm)
esdoc=$(which esdoc)

publish_npm_package() {
    name=$(basename $1)

    if [ -z $2 ] || ! $2; then
        cd $1 && rm -rf node_modules/ &&\
         "${npm}" install --production --no-bin-links --no-optional --no-shrinkwrap &&\
          "${npm}" shrinkwrap &&\
           "${npm}" --no-git-tag-version version $3 &&\
            "${npm}" publish
    else
        cd $1 && "${npm}" version $3
    fi
}

escape_sed() {
    echo $(echo $1 | sed -e 's/[\/&]/\\&/g')
}

assure_esdoc() {
    if [ -z ${esdoc} ]; then
        echo "Installing esdoc..."
        "${npm}" install -g esdoc

        esdoc=$(which esdoc)
    fi
}

assure_npm() {
    if [ -z "${npm}" ]; then
        echo "You may install NPM first!"
    fi
}
