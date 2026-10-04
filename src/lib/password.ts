import "server-only";
import {scrypt as scryptCallback} from "node:crypto";
const DUMMY_HASH=`scrypt$32768$8$1$${"00".repeat(16)}$${"00".repeat(64)}`;
function derive(password:string,salt:Buffer,length:number,options:{N:number;r:number;p:number;maxmem:number}){return new Promise<Buffer>((resolve,reject)=>{scryptCallback(password,salt,length,options,(error,key)=>error?reject(error):resolve(Buffer.from(key)))})}
export async function verifyPassword(password:string,encoded:string|null){const value=encoded??DUMMY_HASH;const [algorithm,n,r,p,saltHex,keyHex]=value.split("$");if(algorithm!=="scrypt"||!n||!r||!p||!saltHex||!keyHex||!/^\d+$/.test(n)||!/^\d+$/.test(r)||!/^\d+$/.test(p)||!/^(?:[a-f\d]{2})+$/.test(saltHex)||!/^(?:[a-f\d]{2})+$/.test(keyHex))return false;const expected=Buffer.from(keyHex,"hex");const actual=await derive(password,Buffer.from(saltHex,"hex"),expected.length,{N:Number(n),r:Number(r),p:Number(p),maxmem:64*1024*1024});return actual.length===expected.length&&requireTimingSafeEqual(actual,expected)&&encoded!==null}
import {timingSafeEqual as requireTimingSafeEqual} from "node:crypto";



