# @jacobbubu/gitlab-ci-registry

> Provides a command-line tool to perform the task of setting "publishConfig.registry" in the gitlab CI pipeline file (gitlab-ci.yml).

## Intro.

If you want to publish your package to the gitlab registry, you need to set the correct URL in the `publishConfig.registry` field of `package.json`, since it contains the `project id`. You can only set this up correctly after the project has been created in GitLab.

To avoid source code containing `project id`, we provide this simple command-line tool that temporarily sets up `publicConfig.registry` by running `npx gitlab-ci-registry ./package.json`.

If `publicConfig.registry` already exists or the CI environment variables are incomplete, there will be no changes to the `package.json` file.
