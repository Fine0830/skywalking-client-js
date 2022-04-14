/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Task from './task';
import { ErrorsCategory, GradeTypeEnum } from './constant';
import { ErrorInfoFields, ReportFields } from './types';

let pageHasjsError: { [key: string]: boolean } = {};
let interval: NodeJS.Timeout;
let logInfo: ErrorInfoFields & ReportFields = {
  uniqueId: '',
  service: '',
  serviceVersion: '',
  pagePath: '',
  category: ErrorsCategory.UNKNOWN_ERROR,
  grade: GradeTypeEnum.INFO,
  errorUrl: '',
  line: 0,
  col: 0,
  message: '',
  firstReportedError: false,
  collector: '',
};
export default class Base {
  public traceInfo(logError?: ErrorInfoFields & ReportFields) {
    logInfo = logError || logInfo;
    const ExcludeErrorTypes: string[] = [
      ErrorsCategory.AJAX_ERROR,
      ErrorsCategory.RESOURCE_ERROR,
      ErrorsCategory.UNKNOWN_ERROR,
    ];
    // mark js error pv
    if (!pageHasjsError[location.href] && !ExcludeErrorTypes.includes(logInfo.category)) {
      pageHasjsError = {
        [location.href]: true,
      };
      logInfo.firstReportedError = true;
    }
    const collector = logInfo.collector;

    delete logInfo.collector;
    Task.addTask(logInfo, collector);
    Task.finallyFireTasks();
    if (interval) {
      return;
    }
    // report errors within 1min
    interval = setInterval(() => {
      Task.fireTasks();
    }, 60000);
  }

  setLogInfo(opt: { [key: string]: unknown }) {
    logInfo = {
      ...logInfo,
      ...opt,
    };
  }
}
