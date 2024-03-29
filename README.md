![hugo-bin](.github/github-card-dark.png#gh-dark-mode-only)
![hugo-bin](.github/github-card-light.png#gh-light-mode-only)

This is a highly experimental project at the moment and tries to combine and normalise the build system across all `@davidsneighbour/hugo-*` projects. Use with caution. Don't blame me if it breaks everything ;) Once I have a version that I trust it will reach v1.0.0.

## Principal mode of operation

The scripts are contained in a `bin` directory and have a structured setup with helpers and scripts and an overall uniform way of function. The `bin` folder should be added to the repository that is using the scripts, as a folder, not a submodule. Updating overrides the existing files and can commit updates to the repository.

## Installation

Note that this will override files in `bin`. Commit all files in `bin` before installing/updating so you have something to `git diff` against at first install.

```bash
sh -c "$(curl -sSL https://raw.githubusercontent.com/davidsneighbour/hugo-bin/main/install)"
```

## Update

Run `bin/self/update`. Then check with `git diff` what's changed (or subscribe to [releases on GitHub](https://github.com/davidsneighbour/hugo-bin/releases)).

## Rules

- As this is the build system for `@dnb-org` components some of the default settings might be more restrictive than you would want them to be --- to keep _ME_ on a high quality coding course. All settings or procedures that might seem controversial will receive configuration options to be "fixed" for your requirements. Feel free to [open an issue about this](https://github.com/davidsneighbour/hugo-bin/issues) if you stumble upon one of these.
- All code should be as self explanatory as possible. This includes useful variable names (for instance `counter` as opposed to `i`, `configurationPath` as opposed to `path`) and probably excessive commenting. As comments don't have any negative impact on compilation or run time it won't ever be seen as loquaciousy.
- The [issue system of this repository](https://github.com/davidsneighbour/hugo-bin/issues) may be (ab)used as Q&A system, as brainstorm collection, as teaching spot. No worries. The worst that can happen is that your "issue" will be locked or closed.

## Configuration

## Requirements

- All scripts expect the project to be a GoHugo project, either by having the file structure of a Hugo website or by supplying a `go.mod` in the directory root. It's in the name, dummy :smirk:
- Required tools may vary by script, but each script will test for availability of its requirement and complain if one is missing. In most cases a simple `apt install TOOLNAME` will suffice, if not the installation of the requirement will be explained in the scripts documentation. I typically try to use scripts that are available in any bash script environment, but sometimes something more specific is required.
- Most scripts expect node/npm to be installed or available. Read [Development Setup](#development-setup) for details on how I set up my local development system.

## Scripts

### Build commands

Dependency configuration for `package.json`:

```json
"devDependencies": {

}
```

Script configuration for `package.json`:

```json
"scripts": {

}
```

### Dev Server

Dependency configuration for `package.json`:

```json
"devDependencies": {

}
```

Script configuration for `package.json`:

```json
"scripts": {

}
```

### Testing

Dependency configuration for `package.json`:

```json
"devDependencies": {

}
```

Script configuration for `package.json`:

```json
"scripts": {

}
```

### Release Hooks

Dependency configuration for `package.json`:

```json
"devDependencies": {

}
```

Script configuration for `package.json`:

```json
"scripts": {

}
```

### Linting

Dependency configuration for `package.json`:

```json
"devDependencies": {

}
```

Script configuration for `package.json`:

```json
"scripts": {

}
```

### Netlify specific scripts

Dependency configuration for `package.json`:

```json
"devDependencies": {

}
```

Script configuration for `package.json`:

```json
"scripts": {

}
```

### Algolia specific scripts

Dependency configuration for `package.json`:

```json
"devDependencies": {

}
```

Script configuration for `package.json`:

```json
"scripts": {

}
```

## Development Setup

### Setup `node` and `npm`

## QI Notes

- We use [shellcheck](https://github.com/koalaman/shellcheck#readme) to improve the code quality in all bash files. While it might make a lot of sense to just silence certain errors we will strive to implement all rules properly. If a `# shellcheck` note is used to silence a warning/error then it will be commented explicitly or a PR with it will be declined. See [this](https://github.com/davidsneighbour/hugo-bin/blob/d06060af52e24ce0a7210e051b6749e49e769de3/bin/lint/find-todos#L17) for an example.
- Currently there is no [pre-commit](https://pre-commit.com/) setup done yet, but in the near future (pre 1.0.0) a commit will need to be validated by `pre-commit` to be accepted.
