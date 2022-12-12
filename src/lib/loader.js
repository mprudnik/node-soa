import fs from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';

const depsStart = 'dependsOn: dependencies([';
const depsEnd = ']),';
const getDeps = (src) => {
  if (!src.includes(depsStart)) return '([]);';

  const start = src.indexOf(depsStart);
  const end = src.indexOf(depsEnd, start);
  const depsLine = src.slice(start, end + depsEnd.length);
  const deps = depsLine.replace(depsStart, '([').replace(depsEnd, ']);');

  return deps;
};

const emptyContext = vm.createContext({});
const getRequiredContext = (line, sandbox, filePath) => {
  const dependsOn = new vm.Script(`'use strict';\n${line}`).runInContext(
    emptyContext,
  );
  const context = {};
  for (const depName of dependsOn) {
    const dependency = sandbox[depName];

    if (!dependency) {
      const relative = filePath.replace(process.cwd(), '');
      throw new Error(
        `${relative} requires non-existing dependency - "${depName}"`,
      );
    }

    context[depName] = dependency;
  }

  return vm.createContext(
    Object.freeze({ ...context, dependencies: (deps) => deps }),
  );
};

const loadRoute = async (filePath, sandbox, options) => {
  const src = await fs.readFile(filePath, 'utf8');
  const deps = getDeps(src);
  const context = getRequiredContext(deps, sandbox, filePath);
  const code = `'use strict';\n${src}`;
  const script = new vm.Script(code);
  const exported = script.runInContext(context, options);
  return exported;
};

export const routing = async (apiPath, sandbox, sandboxOptions) => {
  const fullPath = path.join(process.cwd(), apiPath);
  const routing = {};

  const serviceNames = await fs.readdir(fullPath);
  for (const serviceName of serviceNames) {
    const servicePath = path.join(fullPath, serviceName);
    const file = await fs.stat(servicePath);
    if (!file.isDirectory()) continue;

    routing[serviceName] = {};
    const routeFileNames = await fs.readdir(servicePath);
    for (const fileName of routeFileNames) {
      if (!fileName.endsWith('.js')) continue;
      const routePath = path.join(servicePath, fileName);
      const routeName = path.basename(fileName, '.js');
      routing[serviceName][routeName] = await loadRoute(
        routePath,
        sandbox,
        sandboxOptions,
      );
    }
  }

  return routing;
};

export const deps = async (logger, depsPath, options) => {
  const fullPath = path.join(process.cwd(), depsPath);
  const fileNames = await fs.readdir(fullPath);

  const dependencies = {};
  for (const fileName of fileNames) {
    if (!fileName.endsWith('.js')) continue;
    const filePath = path.join(fullPath, fileName);
    const file = await fs.stat(filePath);
    if (file.isDirectory()) continue;

    const [dependencyName] = fileName.split('.');
    const loadDependency = require(filePath);
    dependencies[dependencyName] = await loadDependency(
      options[dependencyName] ?? {},
      logger,
    );
  }

  return dependencies;
};

export const entities = async (entitiesPath) => {
  const pathToEntities = path.join(process.cwd(), entitiesPath);
  const src = await fs.readFile(pathToEntities, 'utf-8');
  const schema = JSON.parse(src);

  for (const entity of Object.keys(schema)) Object.freeze(schema[entity]);

  return Object.freeze(schema);
};
