/**
 * Created by vcernomschi on 6/20/16.
 */

'use strict';
import combine from 'istanbul-combine';
import fs from 'fs';
import fsExtra from 'fs-extra';
import S3CoverageSynchronizer from './S3CoverageSynchronizer';
import GitHubMsgPublisher from './GitHubMsgPublisher';
import CoverageComparator from './CoverageComparator';

let s3CoverageSync = new S3CoverageSynchronizer();

s3CoverageSync.init((err, data) => {

    s3CoverageSync.downloadReportsFromS3(
      S3CoverageSynchronizer.BUCKET_NAME,
      S3CoverageSynchronizer.REPORT_PREFIX,
      S3CoverageSynchronizer.S3_REPORTS_PATH,
      () => {

        CoverageComparator.gatherReports();

        //copy s3 reports to local
        if (CoverageComparator.accessSync(S3CoverageSynchronizer.S3_REPORTS_PATH)) {
          fsExtra.copySync(S3CoverageSynchronizer.S3_REPORTS_PATH, S3CoverageSynchronizer.LOCAL_REPORTS_PATH);
        }

        //combine/override local coverage
        let localSumPercent = CoverageComparator.combineSync(
          CoverageComparator.LOCAL_COVERAGE_SUMMARY_DIR, CoverageComparator.LOCAL_COVERAGE_PATTERN
        );

        let s3SumPercent = (CoverageComparator.accessSync(CoverageComparator.S3_COVERAGE_FULL_PATH)) ?
          JSON.parse(fs.readFileSync(CoverageComparator.S3_COVERAGE_FULL_PATH, 'utf8')).total.lines.pct :
          0;

        let gitHubMsgPublisher = new GitHubMsgPublisher();

        //add comments when applicable
        gitHubMsgPublisher.addComment(s3SumPercent, localSumPercent, (err) => {
          if (err) {
            console.log(err);
            return;
          }
        });

        //uploading coverage in s3 when !PR
        if (!GitHubMsgPublisher.isPullRequest) {
          s3CoverageSync.syncReportsToS3(
            S3CoverageSynchronizer.LOCAL_REPORTS_PATH,
            S3CoverageSynchronizer.BUCKET_NAME,
            S3CoverageSynchronizer.REPORT_PREFIX,
            () => {
            }
          );
        }
      }
    );
  }
);
