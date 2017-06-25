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
  static get AP_NORTHEAST_TOKYO() {
    return 'ap-northeast-1';
  }

  /**
   * @returns {String}
   */
  static get AP_NORTHEAST_SEOUL() {
    return 'ap-northeast-2';
  }

  /**
   * @returns {String}
   */
  static get AP_SOUTHEAST_SINGAPORE() {
    return 'ap-southeast-1';
  }

  /**
   * @returns {String}
   */
  static get AP_SOUTHEAST_SYDNEY() {
    return 'ap-southeast-2';
  }

  /**
   * @returns {String}
   */
  static get AP_SOUTH_MUMBAI() {
    return 'ap-south-1';
  }

  /**
   * @returns {String}
   */
  static get EU_CENTRAL_FRANKFURT() {
    return 'eu-central-1';
  }

  /**
   * @returns {String}
   */
  static get EU_WEST_IRELAND() {
    return 'eu-west-1';
  }

  /**
   * @returns {String}
   */
  static get EU_WEST_LONDON() {
    return 'eu-west-2';
  }

  /**
   * @returns {String}
   */
  static get SA_EAST_SAO_PAULO() {
    return 'sa-east-1';
  }

  /**
   * @returns {String}
   */
  static get CA_CENTRAL_MONTREAL() {
    return 'ca-central-1';
  }

  /**
   * @returns {String}
   */
  static get US_EAST_VIRGINIA() {
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
  static get US_WEST_CALIFORNIA() {
    return 'us-west-1';
  }

  /**
   * @returns {String}
   */
  static get US_WEST_OREGON() {
    return 'us-west-2';
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
      Region.AP_NORTHEAST_TOKYO,
      Region.AP_NORTHEAST_SEOUL,
      Region.AP_SOUTHEAST_SYDNEY,
      Region.AP_SOUTHEAST_SINGAPORE,
      Region.AP_SOUTH_MUMBAI,
      Region.EU_CENTRAL_FRANKFURT,
      Region.EU_WEST_IRELAND,
      Region.EU_WEST_LONDON,
      Region.SA_EAST_SAO_PAULO,
      Region.CA_CENTRAL_MONTREAL,
      Region.US_EAST_VIRGINIA,
      Region.US_EAST_OHIO,
      Region.US_WEST_CALIFORNIA,
      Region.US_WEST_OREGON,
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
      case Region.CA_CENTRAL_MONTREAL:
      case Region.US_EAST_OHIO:
      case Region.AP_SOUTH_MUMBAI:
      case Region.AP_NORTHEAST_SEOUL:
      case Region.EU_CENTRAL_FRANKFURT:
      case Region.EU_WEST_LONDON:
        prefix = '.';
        break;
      case Region.US_EAST_VIRGINIA:
      case Region.US_WEST_CALIFORNIA:
      case Region.US_WEST_OREGON:
      case Region.AP_SOUTHEAST_SINGAPORE:
      case Region.AP_SOUTHEAST_SYDNEY:
      case Region.AP_NORTHEAST_TOKYO:
      case Region.EU_WEST_IRELAND:
      case Region.SA_EAST_SAO_PAULO:
        prefix = '-';
        break;
      default:
        console.warn(`No s3 website endpoint format specified for ${region}. Fallback to '-' separator.`);
        prefix = '-';
    }

    return prefix;
  }
}
