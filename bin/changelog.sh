#!/usr/bin/env bash

source $(dirname $0)/_head.sh

USER="MitocGroup"
FW_REPOSITORY="deep-framework"
#PM_REPOSITORY="deep-package-manager"
#DF_REPOSITORY="deepify"

LAST_MODIFIED=$(cd "$path/../src/deep-framework"; npm info deep-framework time.modified)
LAST_MODIFIED_TS=$(node -e "console.log(new Date('$LAST_MODIFIED').getTime())")
HEADER="Changes since "$(node -e "console.log(new Date('$LAST_MODIFIED').toLocaleString())")
CHANGELOG_PATH="$path/../changelog"
LATEST_CHANGELOG_PATH="$path/../changelog/latest.md"

ghchangelog=`which gh-changelog`

if [ -z ${ghchangelog} ]; then
    assure_npm

    ${npm} -g install github-changelog
fi

#echo "Credentials are NOT persisted anywhere!"
#read -p "Enter Github user: " GITHUB_USER
#read -s -p "Enter GitHub password: " GITHUB_PWD

mkdir -p ${CHANGELOG_PATH}

if [ -f "$LATEST_CHANGELOG_PATH" ]; then
    cp "$LATEST_CHANGELOG_PATH" "$CHANGELOG_PATH/$LAST_MODIFIED_TS.md"
fi

echo "# deep-framework" > "$LATEST_CHANGELOG_PATH"
${ghchangelog} --header "$HEADER" --owner "$USER" --repo "$FW_REPOSITORY" --since "$LAST_MODIFIED" >> "$LATEST_CHANGELOG_PATH"
echo "# deepify" >> "$LATEST_CHANGELOG_PATH"
echo "### TBD" >> "$LATEST_CHANGELOG_PATH"
#${ghchangelog} --username "$GITHUB_USER" --password "$GITHUB_PWD" --header "$HEADER" --owner "$USER" --repo "$PM_REPOSITORY" --since "$LAST_MODIFIED" >> "$LATEST_CHANGELOG_PATH"
#${ghchangelog} --username "$GITHUB_USER" --password "$GITHUB_PWD" --header "$HEADER" --owner "$USER" --repo "$DF_REPOSITORY" --since "$LAST_MODIFIED" >> "$LATEST_CHANGELOG_PATH"
