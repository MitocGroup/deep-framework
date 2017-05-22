/**
 * Created by AlexanderC on 5/27/15.
 */

'use strict';

/**
 * Available AWS regions
 */
export class Region {
  /**
   * @returns {String}
   */
  static get ANY() {
    return '*';
  }

  /**
   * @returns {String}
   */
  static get ASIA_PACIFIC_TOKYO() {
    return 'ap-northeast-1';
  }

  /**
   * @returns {String}
   */
  static get ASIA_PACIFIC_SEOUL() {
    return 'ap-northeast-2';
  }

  /**
   * @returns {String}
   */
  static get ASIA_PACIFIC_SINGAPORE() {
    return 'ap-southeast-1';
  }

  /**
   * @returns {String}
   */
  static get ASIA_PACIFIC_SYDNEY() {
    return 'ap-southeast-2';
  }

  /**
   * @returns {String}
   */
  static get EU_FRANKFURT() {
    return 'eu-central-1';
  }

  /**
   * @returns {String}
   */
  static get EU_IRELAND() {
    return 'eu-west-1';
  }

  /**
   * @returns {String}
   */
  static get EU_LONDON() {
    return 'eu-west-2';
  }

  /**
   * @returns {String}
   */
  static get SOUTH_AMERICA_SAO_PAULO() {
    return 'sa-east-1';
  }

  /**
   * @returns {String}
   */
  static get US_EAST_N_VIRGINIA() {
    return 'us-east-1';
  }

  /**
   * @returns {String}
   */
  static get US_EAST_OHIO() {
    return 'us-east-2';
  }

  /**
   * @returns {String}
   */
  static get US_WEST_N_CALIFORNIA() {
    return 'us-west-1';
  }

  /**
   * @returns {String}
   */
  static get US_WEST_OREGON() {
    return 'us-west-2';
  }

  /**
   * @returns {String}
   */
  static get AP_SOUTH_MUMBAI() {
    return 'ap-south-1';
  }

  /**
   * @param {String} name
   * @returns {Boolean}
   */
  static exists(name) {
    return name === '' || -1 !== Region.list().indexOf(name);
  }

  /**
   * @returns {String[]}
   */
  static list() {
    return [
      Region.ANY,
      Region.ASIA_PACIFIC_TOKYO,
      Region.ASIA_PACIFIC_SEOUL,
      Region.ASIA_PACIFIC_SYDNEY,
      Region.ASIA_PACIFIC_SINGAPORE,
      Region.EU_FRANKFURT,
      Region.EU_IRELAND,
      Region.EU_LONDON,
      Region.SOUTH_AMERICA_SAO_PAULO,
      Region.US_EAST_N_VIRGINIA,
      Region.US_EAST_OHIO,
      Region.US_WEST_N_CALIFORNIA,
      Region.US_WEST_OREGON,
      Region.AP_SOUTH_MUMBAI,
    ];
  }

  /**
   * List method alias
   *
   * @returns {String[]}
   */
  static all() {
    return Region.list();
  }

  /**
   * @param {string} defaultRegion
   * @param {array} availableRegions
   * @returns {string}
   */
  static getAppropriateAwsRegion(defaultRegion, availableRegions) {
    if (availableRegions.indexOf(defaultRegion) !== -1) {
      return defaultRegion;
    }

    let regionContinent = defaultRegion.split('-')[0];

    for (let regionKey in availableRegions) {
      if (!availableRegions.hasOwnProperty(regionKey)) {
        continue;
      }

      let region = availableRegions[regionKey];

      if (region === Region.ANY) {
        return defaultRegion;
      }

      if (region.split('-')[0] === regionContinent) {
        return region;
      }
    }

    return availableRegions[0]; // fallback to first available region
  }

  /**
   *
   * @param {String} region
   * @returns {String}
   */
  static getRegionPrefix(region) {
    let prefix = null;

    switch (region) {
      case Region.US_EAST_OHIO:
      case Region.AP_SOUTH_MUMBAI:
      case Region.ASIA_PACIFIC_SEOUL:
      case Region.EU_FRANKFURT:
      case Region.EU_LONDON:
        prefix = '.';
        break;
      case Region.US_EAST_N_VIRGINIA:
      case Region.US_WEST_N_CALIFORNIA:
      case Region.US_WEST_OREGON:
      case Region.ASIA_PACIFIC_SINGAPORE:
      case Region.ASIA_PACIFIC_SYDNEY:
      case Region.ASIA_PACIFIC_TOKYO:
      case Region.EU_IRELAND:
      case Region.SOUTH_AMERICA_SAO_PAULO:
        prefix = '-';
        break;
      default:
        console.warn(`No s3 website endpoint format specified for ${region}. Fallback to '-' separator.`);
        prefix = '-';
    }

    return prefix;
  }
}
