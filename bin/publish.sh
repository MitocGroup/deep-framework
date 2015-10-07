#!/usr/bin/env bash

source $(dirname $0)/_head.sh

assure_npm

DRY_RUN=false
HELP=false
PACKAGE_PATH=""
VERSION_TYPE="patch"

for i in "$@"
do
    case ${i} in
        --patch)
        VERSION_TYPE="patch"
        ;;
        --minor)
        VERSION_TYPE="minor"
        ;;
        --major)
        VERSION_TYPE="major"
        ;;
        --help)
        HELP=true
        ;;
        --dry-run)
        DRY_RUN=true
        ;;
        *)
        PACKAGE_PATH=${i}
        ;;
    esac

    shift
done

if ${HELP}; then
    echo "-------------------------------------------------------------------"
    echo "Usage example: bin/publish.sh src/deep-db --dry-run"
    echo ""
    echo "Arguments and options:"
    echo "      src/deep-db  The path to the certain package to be published"
    echo "      --dry-run    Skip uploading packages to NPM registry"
    echo "-------------------------------------------------------------------"
    exit 0
fi

if ${DRY_RUN}; then
    echo ""
    echo "Dry run mode on!!!"
    echo ""
fi

if [ -z ${PACKAGE_PATH} ]; then
    publish_npm_package ${path}/../src/deep-core/ ${DRY_RUN} ${VERSION_TYPE}
    publish_npm_package ${path}/../src/deep-di/ ${DRY_RUN} ${VERSION_TYPE}
    publish_npm_package ${path}/../src/deep-kernel/ ${DRY_RUN} ${VERSION_TYPE}
    publish_npm_package ${path}/../src/deep-validation/ ${DRY_RUN} ${VERSION_TYPE}

    for src in ${path}/../src/deep-*/; do
      name=$(basename ${src})

      if [ ${name} != 'deep-framework' ] && [ ${name} != 'deep-core' ] && [ ${name} != 'deep-di' ] && [ ${name} != 'deep-kernel' ] && [ ${name} != 'deep-validation' ]; then
        publish_npm_package ${src} ${DRY_RUN} ${VERSION_TYPE}
      fi
    done

    publish_npm_package ${path}/../src/deep-framework/ ${DRY_RUN} ${VERSION_TYPE}
else
    publish_npm_package ${PACKAGE_PATH} ${DRY_RUN} ${VERSION_TYPE}
fi
