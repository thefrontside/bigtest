import { join } from 'path';
import chalk from 'chalk';
import { Operation } from 'effection';
import { ProjectOptions } from '@bigtest/project';
import { createContext, ReportBase } from 'istanbul-lib-report';
import { createCoverageMap } from 'istanbul-lib-coverage';
import { create as createReport } from 'istanbul-reports';

import { TestResults } from './query';

export function* reportCoverage(config: ProjectOptions, results: TestResults): Operation<void> {
  let coverageData = results.testRun.coverage;
  if (!coverageData) {
    console.warn("\u26a0️" + chalk.yellowBright('  coverage reporting was requested, but no coverage metrics were present in your application. This usually means that it has not been instrumented. See https://github.com/thefrontside/bigtest/issues/569 for details on how to integrate code coverage with BigTest'))
  } else if (config.coverage.reports.length < 1) {
    console.warn("\u26a0️" + chalk.yellowBright('  coverage reporting was requested, but no reports were specified in your project config. To enable reporting, add at least one report to the coverage.reports field of bigtest.json, e.g. ["lcov", "json"]'));
  } else {
    yield renderReports(config, coverageData);
    console.log(
      chalk.cyan.bold('@bigtest/coverage') + ': ' +
        chalk.cyan(`${config.coverage.reports.join(',')} reported to -> ${config.coverage.directory}`))
  }
}

function* renderReports(config: ProjectOptions, data: string): Operation<void> {
  let { reports, directory } = config.coverage;

  let coverageMap = createCoverageMap(JSON.parse(data));

  for (let reportName of reports) {
    let report = createReport(reportName) as unknown as ReportBase;
    report.execute(createContext({
      dir: join(directory, reportName),
      coverageMap
    }));
  }
}
