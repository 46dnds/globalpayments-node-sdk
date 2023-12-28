const HttpsProxyAgent = require('https-proxy-agent');
const fetch = require('node-fetch');
import { ApiError, GatewayError } from "../Entities/Errors";
const _fetch=(url: string,options: Object)=>{
  if (options === undefined) {
    options = {};
  }
  return new Promise((resolve, reject) => {
    const c = new AbortController();
    const timer = setTimeout(() => {
      c.abort(new ApiError("Socket timeout occurred."));
    }, options.timeout || 1000*60*5)
    fetch(url,{...options,signal:c.signal,agent: process.env.https_proxy?new HttpsProxyAgent(process.env.https_proxy):null})
    .then(value => {
      clearTimeout(timer)
      resolve(value)
    })
    .catch(reason => {
      clearTimeout(timer)
      reject(reason)
    })
  });
};
export const request = (
  data?: string,
  options?: Object,
): Promise<string> =>
  new Promise((resolve, reject) => {
    if (options === undefined) {
      options = {};
    }
    _fetch('https://'+options.host+(options.port && options.port!=443?':'+options.port:'')+options.path,{
      method:options.method.toUpperCase(),
      headers:options.headers,
      timeout:this.timeout || 100000,
      body:data
    }).then((ans)=>{
      if(ans.status==200){
        ans.text().then((body)=>{
            resolve(body);
        });
        return;
      }
      reject(new GatewayError(`Unexpected HTTP status code [${ans.status}]`));
    }).catch(reject);
  });
