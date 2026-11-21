# Maintaining

## Release Process

Releases are made by [semantic-release](https://semantic-release.gitbook.io/) from the commits on `master`. There is no version to bump and no release to draft: `package.json` carries the placeholder `0.0.0-development`, and the version is derived from the commit history when publishing.

### What triggers a release

Pull requests are squash merged, and the subject of the squash commit decides the release. It has to follow [Conventional Commits](https://www.conventionalcommits.org/). GitHub proposes the pull request title as the subject when the pull request has several commits, and the commit's own message when it has one. The `PR title` check only sees the title, so keep the title and a single commit's subject the same, and read the subject in the merge dialog before confirming.

| Title | Release
| ----- | -------
| `fix: ...`, `perf: ...` | patch
| `feat: ...` | minor
| any type with `!` (`feat!: ...`), or a `BREAKING CHANGE:` footer in the commit body | major
| `docs:`, `chore:`, `ci:`, `test:`, `refactor:`, `build:`, `style:` | none

Use a releasing type only when the published package changes. The scope does not matter.

Only `master` releases, always to the `latest` npm tag. Prereleases and the `next` tag are not set up.

Dependabot titles its pull requests `chore(deps): ...` or `chore(deps-dev): ...`, which do not release. If a bump changes what is published, edit the title to `fix(deps): ...` before merging.

Text in the commit body ends up in the release notes: a bare `#123` there is listed as an issue the release closes. Use a URL to refer to an issue the commit does not close.

### What a release does

Every push to `master` runs the `Release` workflow. When the commits since the last tag call for a release, it:

1. runs the build and the test suite
1. publishes the package to [npm](https://www.npmjs.com/package/chartjs-plugin-zoom) with provenance, through npm trusted publishing (OIDC) -- there is no npm token to maintain
1. pushes the `v{version}` tag and creates the GitHub release with generated notes, attaching `chartjs-plugin-zoom.js`, `chartjs-plugin-zoom.min.js` and the package tarball
1. comments on the pull requests and issues the release includes
1. builds the documentation and deploys it to `/{version}/` and `/latest/` on GitHub Pages

[cdnjs](https://cdnjs.com/libraries/chartjs-plugin-zoom) and jsDelivr pick the release up from npm.

### Setup the release depends on

- On npmjs.com, the package has a trusted publisher: repository `chartjs/chartjs-plugin-zoom`, workflow `release.yml`.
- The docs deploy uses a GitHub App: the `DOCS_DEPLOY_CLIENT_ID` Actions variable and the `DOCS_DEPLOY_PRIVATE_KEY` secret.

### When a release fails halfway

semantic-release pushes the tag first, then publishes to npm, then creates the GitHub release. What to do depends on how far it got:

- **npm does not have the version** (`npm view chartjs-plugin-zoom versions`): delete the remote tag and re-run the `Release` workflow. Without the tag semantic-release computes the same version again. Re-running with the tag in place does nothing, because the commits count as released.
- **npm has the version but the GitHub release is missing**: do not delete the tag, since publishing the same version again fails. Create the GitHub release for the tag by hand, and deploy the docs by running the steps of the `docs` job locally or from a temporary branch.
- **only the `docs` job failed**: use "Re-run failed jobs". "Re-run all jobs" finds nothing new to release and skips the docs. The job pushes to `gh-pages`, as the `documentation` workflow does, and can lose that race when both run at once.

## Other Automated Tasks

### documentation

Builds the documentation for every pull request, and deploys it to `/master/` on every push to `master`.

### compressed-size

Triggered for each pull request. Calculates the compressed size compared to master. The result can be seen in the action log.
