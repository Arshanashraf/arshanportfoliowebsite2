import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";
process.loadEnvFile(".env.local");
const scrypt=promisify(scryptCallback);
async function hiddenInput(prompt){if(!stdin.isTTY||typeof stdin.setRawMode!=="function")throw new Error("Run this setup command in an interactive terminal so the password is not echoed.");stdout.write(prompt);stdin.setRawMode(true);stdin.resume();return new Promise((resolve,reject)=>{let value="";function finish(error){stdin.setRawMode(false);stdin.pause();stdin.removeListener("data",onData);stdout.write("\n");if(error){reject(error)}else{resolve(value)}}function onData(chunk){for(const char of chunk.toString("utf8")){if(char==="\u0003")return finish(new Error("Cancelled."));if(char==="\r"||char==="\n")return finish();if(char==="\u007f"||char==="\b")value=value.slice(0,-1);else value+=char}}stdin.on("data",onData)})}
const connectionString=process.env.DATABASE_URL;if(!connectionString)throw new Error("Set DATABASE_URL before creating the owner account.");
const rl=createInterface({input:stdin,output:stdout});let email;try{email=(await rl.question("Owner email: ")).trim().toLowerCase()}finally{rl.close()}
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error("Enter a valid email address.");const password=await hiddenInput("Password (at least 14 characters): ");if(password.length<14)throw new Error("Use at least 14 characters.");const confirm=await hiddenInput("Confirm password: ");if(password!==confirm)throw new Error("Passwords do not match.");
const salt=randomBytes(16);const key=await scrypt(password,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});const encoded=`scrypt$32768$8$1$${salt.toString("hex")}$${Buffer.from(key).toString("hex")}`;const pool=new pg.Pool({connectionString,max:1,connectionTimeoutMillis:5000});try{await pool.query("INSERT INTO admin_users(email,password_hash) VALUES($1,$2)",[email,encoded]);console.log("Owner account created.")}finally{await pool.end()}

