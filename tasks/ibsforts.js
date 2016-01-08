// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.
'use strict';
var ibsforts_1 = require('ibsforts');
var Logger = (function () {
    function Logger(grunt) {
        this.grunt = grunt;
    }
    Logger.prototype.log = function (message, time) {
        this.grunt.log.writeln(time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds() + ": " + message);
    };
    Logger.prototype.warn = function (message, time) {
        this.grunt.log.warn(message);
    };
    Logger.prototype.error = function (err, time) {
        if (err instanceof Error) {
            this.grunt.log.error(err.stack || err.message);
        }
        else {
            this.grunt.log.error(err.toString());
        }
    };
    return Logger;
})();
function loadPostCompileTransforms(plugins) {
    return plugins.map(function (pluginOptions) {
        var module = require(pluginOptions.module);
        var plugin = module.createPlugin(pluginOptions.options);
        return plugin[pluginOptions.transform].bind(plugin);
    });
}
function activatePlugin(grunt) {
    // This task sets up an incremental build server for TypeScript projects that watches and
    // rebuilds TypeScript source files when they are modified. Optional transformations can be
    // applied to the generated code before it's written out to disk.
    grunt.registerMultiTask('ibsforts', 'Build TypeScript projects, or rebuild when source files change', function () {
        var task = this;
        var defaults = {
            projects: []
        };
        var options = task.options(defaults);
        // if options.projectConfigPath is set then build/watch just the one project,
        // otherwise build/watch all the projects listed in options.projects
        var projects = options.projects;
        if (options.projectConfigPath) {
            projects = [{
                    projectConfigPath: options.projectConfigPath,
                    plugins: options.plugins
                }];
        }
        var done = task.async();
        var logger = new Logger(grunt);
        if (options.watch) {
            var server = new ibsforts_1.IncrementalBuildServer(logger);
            projects.map(function (projectOptions) {
                return ibsforts_1.ProjectLoader.loadFromConfigFile(projectOptions.projectConfigPath)
                    .then(function (project) {
                    project.postCompileTransforms = loadPostCompileTransforms(projectOptions.plugins);
                    return server.watchProject(project);
                })
                    .catch(function (err) {
                    grunt.log.error(err.stack || err.message);
                    done(false);
                });
            });
        }
        else {
            var server = new ibsforts_1.BuildServer(logger);
            Promise.all(projects.map(function (projectOptions) {
                grunt.log.writeln("Building " + projectOptions.projectConfigPath + " ...");
                return ibsforts_1.ProjectLoader.loadFromConfigFile(projectOptions.projectConfigPath)
                    .then(function (project) {
                    project.postCompileTransforms = loadPostCompileTransforms(projectOptions.plugins);
                    return server.build(project);
                })
                    .catch(function (err) {
                    grunt.log.error(err.stack || err.message);
                    done(false);
                });
            }))
                .then(function (results) { return done(!results.some(function (result) { return result === false; })); });
        }
    });
}
module.exports = activatePlugin;
