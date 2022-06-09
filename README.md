# srt2ass

This is a converter for SRT files to ASS, written in nodeJS.

This is used by [Karaoke Mugen](https://karaokes.moe) but can be freely used by just anything else.

WARNING : this is an ES Module.

## Installation

Run `npm install -g srt2ass` to install as a global module (and get the CLI version)

Run `npm install srt2ass` to install as a module for your project.

## Usage

### Module

As a module here's the method to use it :

#### convertToASS(srt: string)

Returns a correctly formatted ASS file as a string. You need to provide the contents of the SRT file as the first parameter.

### CLI

The CLI version is used as follows :

```sh
srt2ass myfile.srt
```

It produces an ASS file on stdout.

## Build

If you wish to build from source, use `npm run-script build` to get standard JS in the `dist` folder.

## Test

You can test code with the `srt` file included in the test directory :

```sh
node dist/index.cjs test/srt.srt
```

## License

MIT
