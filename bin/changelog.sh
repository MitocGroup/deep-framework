#!/usr/bin/env bash

path=$(cd $(dirname $0); pwd -P)

### Your changes here
CHANGELOG_PATH="$path/../changelog"
LATEST_CHANGELOG_PATH="$path/../CHANGELOG.md"
### End

LAST_MODIFIED=$1

npm=$(which npm)
ghchangelog=`which gh-changelog`

GIT_REMOTE_URL=$(git config --get remote.origin.url)
GIT_REMOTE_PARTS=($(node -e "var p='$GIT_REMOTE_URL'.match(/^git@github.com:([^\/]+)\/(.+)\.git$/);console.log(p[1]);console.log(p[2])"))

USER=${GIT_REMOTE_PARTS[0]}
REPOSITORY=${GIT_REMOTE_PARTS[1]}

if [ -z ${USER} ] || [ -z ${REPOSITORY} ]; then
    echo "Seems like you did not set up a GitHub remote origin!"
    exit 1
fi

NPM_EXISTS=$(npm info ${REPOSITORY} &>/dev/null; echo $?)

if [ "$NPM_EXISTS" == 0 ]; then
    LAST_MODIFIED=$(npm info ${REPOSITORY} time.modified)
fi

if [ -z ${LAST_MODIFIED} ]; then
    echo "Missing NPM package to pick up time.modified!"
    echo ""
    echo "You must provide last modified datetime string manually (ex. ./changelog.sh 2015-10-26T10:06:58.407Z)"
    exit 1
fi

LAST_MODIFIED_TS=$(node -e "console.log(new Date('$LAST_MODIFIED').getTime())")
HEADER="Changes since "$(node -e "console.log(new Date('$LAST_MODIFIED').toLocaleString())")


if [ -z "${npm}" ]; then
    echo "You may install NPM first!"
fi

if [ -z ${ghchangelog} ]; then
    assure_npm

    "${npm}" -g install github-changelog
fi

mkdir -p ${CHANGELOG_PATH}

if [ -f "$LATEST_CHANGELOG_PATH" ]; then
    cp "$LATEST_CHANGELOG_PATH" "$CHANGELOG_PATH/$LAST_MODIFIED_TS.md"
fi

${ghchangelog} --header "$HEADER" --owner "$USER" --repo "$REPOSITORY" --since "$LAST_MODIFIED" > "$LATEST_CHANGELOG_PATH"
