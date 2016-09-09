/**
 * Created by vcernomschi on 6/17/16.
 */

'use strict';

import GitHubApi from 'github';

export default class GitHubMsgPublisher {

  /**
   * @returns {string}
   * @constructor
   */
  static get isPullRequest() {
    let pullRequest = process.env['TRAVIS_PULL_REQUEST'];

    return (pullRequest !== 'false' || !isNaN(pullRequest));
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get gitPRNumber() {
    return process.env['TRAVIS_PULL_REQUEST'];
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get gitPrUrl() {
    return `https://api.github.com/repos/${GitHubMsgPublisher.gitUser}/${GitHubMsgPublisher.gitRepoName}/pulls/${GitHubMsgPublisher.gitPRNumber}`;
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get gitUser() {
    return process.env['TRAVIS_REPO_SLUG'].replace(/(.*)\/.*/i, '$1');
  }

  /**
   * @returns {string}
   * @constructor
   */
  static get gitRepoName() {
    return process.env['TRAVIS_REPO_SLUG'].replace(/.*\/(.*)/i, '$1');
  }

  constructor() {
    this.github = new GitHubApi({
      debug: false,
      protocol: 'https',
      host: 'api.github.com',
      timeout: 5000,
      headers: {
        'user-agent': 'Code-Coverage-GitHub-App'
      },
      followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
      includePreview: true // default: false; includes accept headers to allow use of stuff under preview period
    });

    this.github.authenticate({
      type: 'oauth',
      token: process.env['GITHUB_OAUTH_TOKEN'],
    });
  }

  /**
   * Add comments for PR or fails if coverage
   * @param {Number} s3SumPercent - s3 summary coverage percent
   * @param {Number} localSumPercent - local summary coverage percent
   * @param {Function} callback
   */
  addComment(s3SumPercent, localSumPercent, callback) {
    let commentMsg;

    //failed if coverage decreased more that 1 %
    let isFailed = ((localSumPercent + 1) < s3SumPercent);
    let failMsg = 'Failed due to decreasing coverage';

    //no need to add comments for !PR
    if (!GitHubMsgPublisher.isPullRequest) {
      callback(null, null);
      return;
    }

    if (isFailed) {
      commentMsg = `:x: coverage decreased from ${s3SumPercent}% to ${localSumPercent}%`;
    } else if (localSumPercent === s3SumPercent) {
      commentMsg = `:white_check_mark: coverage remained the same at ${localSumPercent}%`;
    } else if (-1 < (localSumPercent - s3SumPercent) && (localSumPercent - s3SumPercent) < 0) {
      commentMsg = `:warning: coverage decreased less than 1% from ${s3SumPercent}% to ${localSumPercent}%`;
    } else {
      commentMsg = `:white_check_mark: coverage increased from ${s3SumPercent}% to ${localSumPercent}%`;
    }

    this.github.issues.getComments({
        user: GitHubMsgPublisher.gitUser,
        repo: GitHubMsgPublisher.gitRepoName,
        number: GitHubMsgPublisher.gitPRNumber,
      }, (err, issues) => {
        let isCommentAdded = false;

        if (err) {
          console.log(err);
          callback(err, null);
          return;
        }

        for (let issue of issues) {
          if (issue.hasOwnProperty('body') && issue.body === commentMsg) {
            isCommentAdded = true;
            console.log('Comment has already been added: ', commentMsg);

            if (isFailed) {
              console.log(failMsg);
              process.exit(1)
            }
          }
        }

        if (!isCommentAdded) {
          this.github.issues.createComment({
            user: GitHubMsgPublisher.gitUser,
            repo: GitHubMsgPublisher.gitRepoName,
            number: GitHubMsgPublisher.gitPRNumber,
            body: commentMsg,
          }, (err, res) => {
            if (err) {
              console.log(err);
              callback(err, null);
              return;
            }

            callback(null, res);

            if (isFailed) {
              console.log(failMsg);
              process.exit(1)
            }
          });
        }
      }
    );
  }
}
