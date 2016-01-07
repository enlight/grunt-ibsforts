# grunt-ibsforts

> Grunt plugin that provides a task to execute the Incremental Build Server for TypeScript.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the
[Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a
[Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.
Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install enlight/grunt-ibsforts --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line:

```js
grunt.loadNpmTasks('grunt-ibsforts');
```

## The `ibsforts` task

### Overview
In your project's `Gruntfile.js`, add a section named `ibsforts` to the data object passed into
`grunt.initConfig()`.

```js
grunt.initConfig({
  ibsforts: {
    options: {
      // Default options for all targets.
    },
    your_target: {
      options: {
        // Target-specific options that override default options.
      }
    },
    your_other_target: {
      options: {
        // Target-specific options that override default options.
      }
    }
  }
});
```

### Options

#### options.projectConfigPath
Type: `string`
Default value: `undefined`

TODO

#### options.plugins
Type: `Array<{}>`
Default value: `undefined`

TODO

#### options.projects
Type: `Array<{}>`
Default value: `undefined`

TODO

#### options.watch
Type: `boolean`
Default value: `undefined`

TODO

### Usage Examples

TODO

## License
MIT
