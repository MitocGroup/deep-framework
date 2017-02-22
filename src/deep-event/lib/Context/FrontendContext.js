/**
 * Created by AlexanderC on 2/22/17.
 */

'use strict';

import {BackendContext} from './BackendContext';
import {ClientSession} from './Frontend/ClientSession';

export class FrontendContext extends BackendContext {
  /**
   * @param {Kernel|*} kernel
   *
   * @returns {AbstractContext|*}
   */
  static fromKernel(kernel) {
    return super.fromKernel(kernel)
      .addObj(FrontendContext.clientData)
      .addObj(FrontendContext.envData);
  }
  
  /**
   * @returns {*}
   */
  static get clientData() {
    return {
      sessionId: ClientSession.instance.getSessionId(),
      fingerprint: ClientSession.instance.getFingerprint(),
      browser: ClientSession.instance.getBrowser(),
      browserVersion: ClientSession.instance.getBrowserVersion(),
      os: ClientSession.instance.getOS(),
      osVersion: ClientSession.instance.getOSVersion(),
      resolution: ClientSession.instance.getCurrentResolution(),
      timezone: ClientSession.instance.getTimeZone(),
      language: ClientSession.instance.getLanguage(),
    };
  }
  
  /**
   * @returns {*}
   */
  static get envData() {
    return {
      location: {
        hash: window.location.hash,
        host: window.location.host,
        href: window.location.href,
        origin: window.location.origin,
        pathname: window.location.pathname,
        port: window.location.port,
        protocol: window.location.protocol,
        search: window.location.search,
      },
      propertyId: window.location.host, // @todo read from env?
      platform: ClientSession.instance.getSitePlatform(),
    };
  }
}
