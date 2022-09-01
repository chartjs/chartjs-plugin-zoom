# Maintaining

## Release Process

Series of github actions are used to automate the library [releases](https://github.com/chartjs/chartjs-plugin-zoom/releases).

### Releasing a New Version

`release-drafter` action updates a draft of release notes after each push. Its based on labels and the commit messages, so its important to label pull requests and have clean commits. If the draft contains commits that do not fall under any heading, those commits should be labeled and the drafter re-run from [actions](https://github.com/chartjs/chartjs-plugin-zoom/actions).

1. update `master` `package.json` version using [semver](https://semver.org/) semantic
1. update the tag and version in the release draft to match `package.json`. Mark it as `pre-release` if you would like to publish with `next` tag on [npmjs](https://www.npmjs.com/package/chartjs-plugin-zoom)
1. publish the release in GitHub. Publishing will trigger the `publish-npm` action. You can monitor the process in [actions](https://github.com/chartjs/chartjs-plugin-zoom/actions)

### Automated Tasks

#### release-drafter

Triggered for each push to master. Creates or updates a draft of release notes for next release.

#### compressed-size

Triggered for each pull-request. Calculates the compressed size compared to master. Result can be seen in the action log.

#### npm-publish

Publishing a GitHub release off the automated release process:

* build of the `dist/*.js` files
* `chartjs-plugin-zoom-{version}.tgz` package is generated, containing dist files and examples
* `dist/*.js` and `chartjs-plugin-zoom-{version}.tgz` are attached to the GitHub release tag
* a new npm package is published on [npmjs](https://www.npmjs.com/package/chartjs-plugin-zoom)

Finally, [cdnjs](https://cdnjs.com/libraries/chartjs-plugin-zoom) is automatically updated from the npm release.
