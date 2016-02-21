// Copyright (c) 2016 Vadim Macagon
// MIT License, see LICENSE file for full terms.

'use strict';

import {
  BuildServer, IncrementalBuildServer, ProjectLoader, ILogger, PostCompileTransform
} from 'ibsforts';

interface IPluginOptions {
  module: string;
  transform: string;
  options: any;
}

interface IProjectOptions {
  projectConfigPath: string;
  plugins?: IPluginOptions[];
}

interface ITaskOptions {
  projectConfigPath?: string;
  /**
   * Plugins to load when building the project in [[projectConfigPath]].
   * Ignored if [[projectConfigPath]] is not set.
   */
  plugins?: IPluginOptions[];
  /**
   * Options for projects that should be built/watched.
   * Ignored if [[projectConfigPath]] is set.
   */
  projects?: IProjectOptions[];
  /**
   * If `true` the project(s) will be watched and rebuilt incrementally, otherwise the task will
   * just build the project(s) and exit. Defaults to `false`.
   */
  watch?: boolean;
}

class Logger implements ILogger {
  constructor(private grunt: IGrunt) {
  }

  log(message: string, time: Date): void {
    this.grunt.log.writeln(
      `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}: ${message}`
    );
  }

  warn(message: string, time: Date): void {
    this.grunt.log.warn(message);
  }

  error(err: Error | string, time: Date): void {
    if (err instanceof Error) {
      this.grunt.log.error(err.stack || err.message);
    } else {
      this.grunt.log.error(err.toString());
    }
  }
}

function loadPostCompileTransforms(plugins: IPluginOptions[]): PostCompileTransform[] {
  return plugins.map(pluginOptions => {
    const module = require(pluginOptions.module);
    const plugin = module.createPlugin(pluginOptions.options);
    return plugin[pluginOptions.transform].bind(plugin);
  });
}

function activatePlugin(grunt: IGrunt) {
  // This task sets up an incremental build server for TypeScript projects that watches and
  // rebuilds TypeScript source files when they are modified. Optional transformations can be
  // applied to the generated code before it's written out to disk.
  grunt.registerMultiTask('ibsforts', 'Build TypeScript projects, or rebuild when source files change', function () {
    const task: grunt.task.ITask = this;
    const defaults: ITaskOptions = {
      projects: []
    };
    const options = task.options<ITaskOptions>(defaults);
    // if options.projectConfigPath is set then build/watch just the one project,
    // otherwise build/watch all the projects listed in options.projects
    let projects = options.projects;
    if (options.projectConfigPath) {
      projects = [{
        projectConfigPath: options.projectConfigPath,
        plugins: options.plugins
      }];
    }

    const done = task.async();
    const logger = new Logger(grunt);

    if (options.watch) {
      const server = new IncrementalBuildServer(logger);
      projects.map(projectOptions =>
        ProjectLoader.loadFromConfigFile(projectOptions.projectConfigPath)
        .then(project => {
          project.postCompileTransforms = loadPostCompileTransforms(projectOptions.plugins || []);
          return server.watchProject(project);
        })
        .catch((err: Error) => {
          grunt.log.error(err.stack || err.message);
          done(false);
        })
      );
    } else {
      const server = new BuildServer(logger);
      Promise.all(projects.map(projectOptions => {
        grunt.log.writeln(`Building ${projectOptions.projectConfigPath} ...`);
        return ProjectLoader.loadFromConfigFile(projectOptions.projectConfigPath)
        .then(project => {
          project.postCompileTransforms = loadPostCompileTransforms(projectOptions.plugins || []);
          return server.build(project);
        })
        .catch((err: Error) => {
          grunt.log.error(err.stack || err.message);
          done(false);
        })
      }))
      .then(results => done(!results.some(result => result === false)));
    }
  });
}

export = activatePlugin;
