# eslint-formatter-gcq

An opinionated ESLint formatter that outputs [GitLab Code Quality compatible JSON](https://docs.gitlab.com/ee/ci/testing/code_quality.html#implement-a-custom-tool).
It will always write a stylish formatted report to the terminal and JSON to the ESLint output.

## Install

Install the package with your favorite package manager, example for NPM:

```shell
npm install -D eslint-formatter-gcq
```

## Usage

Run ESLint with the -f (or --format) and -o (or --output) flags like so:

```shell
eslint -f gcq -o codequality.json
```

You can also use "eslint-formatter-gcq" as formatter name.

## In GitLab CI

Add a lint script to your package.json:

```json
{
 "scripts": {
  "lint": "eslint .",
 }
}

```

Next, add a linting task to your gitlab-ci.yaml:

```yaml
lint:
  image: node:alpine
  script:
    - npm ci
    - npm run lint -- -f gcq -o codequality.json|| true
  artifacts:
    reports:
      codequality:
        - codequality.json
```

And now you are ready to lint in CI!
