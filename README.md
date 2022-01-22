This is a highly experimental project at the moment and tries to combine and normalise the build system across all `@dnb-org/dnb-hugo-*` projects. Use with caution. Don't blame me if it breaks everything ;) Once I have a version that I trust it will reach v1.0.0.

## Principal mode of operation

The scripts are contained in a `bin` directory and have a structured setup with helpers and scripts and an overall uniform way of function. The `bin` folder should be added to the repository that is using the scripts, as a folder, not a submodule. Updating overrides the existing files and can commit updates to the repository.

## Installation

Note that this will override files in `bin`. Either modify to fit your paths or commit all files in `bin` so you have something to `git diff` against at first install.

```bash
git clone https://github.com/dnb-org/dnb-hugo-bin tmp.bin && mkdir -p bin && cp -R tmp.bin/bin bin && rm -rf tmp.bin
```

## Update

Run `bin/self/update`. Then check with `git diff` what's changed (or subscribe to [releases on GitHub](https://github.com/dnb-org/dnb-hugo-bin/releases)).

## Configuration

## Requirements

- All scripts expect the project to be a GoHugo project, either by having the file structure of a Hugo website or by supplying a `go.mod` in the directory root. It's in the name, dummy :smirk:
- Required tools may vary by script, but each script will test for availability of its requirement and complain if one is missing. In most cases a simple `apt install TOOLNAME` will suffice, if not the installation of the requirement will be explained in the scripts documentation. I typically try to use scripts that are available in any bash script environment, but sometimes something more specific is required.
- Most scripts expect node/npm to be installed or available. Read [Development Setup](#developmentsetup) for details on how I set up my local development system.

## Scripts

### Build commands

### Dev Server

### Testing

### Release Hooks

### Linting

### Netlify specific scripts

### Algolia specific scripts

## Develoment Setup
