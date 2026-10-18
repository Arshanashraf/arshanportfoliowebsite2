import "server-only";
import {database,isDatabaseConfigured} from "@/lib/database";
export type PublicSkill={id:string;name:string;group_name:string;confidence:"core"|"working_knowledge"|"currently_learning"|"exploring";description:string};
export type PublicExperience={id:string;organization:string;role:string;started_on:Date|null;ended_on:Date|null;description:string};
export type PublicSettings=Record<string,string|number>;
export async function getPublicSettings(keys:string[]):Promise<PublicSettings>{if(!isDatabaseConfigured()||!keys.length)return{};try{const {rows}=await database().query<{key:string;value:unknown}>("SELECT key,value FROM portfolio_settings WHERE key=ANY($1::text[])",[keys]);return Object.fromEntries(rows.map(({key,value})=>[key,value as string|number]))}catch{return{}}}
export async function getContactRetentionDays(){const settings=await getPublicSettings(["privacy_retention_days"]);const value=Number(settings.privacy_retention_days);return Number.isInteger(value)&&value>=1&&value<=365?value:null}export type PublicAchievement={id:string;title:string;achieved_on:Date|null;description:string;evidence_url:string|null};
export async function getPublicProfileRecords(){
  const empty={skills:[] as PublicSkill[],experience:[] as PublicExperience[],achievements:[] as PublicAchievement[]};
  if(!isDatabaseConfigured())return empty;
  try{
    const pool=database();
    const [skills,experience,achievements]=await Promise.all([pool.query<PublicSkill>("SELECT id,name,group_name,confidence,description FROM skills WHERE is_visible=true ORDER BY sort_order,name"),pool.query<PublicExperience>("SELECT id,organization,role,started_on,ended_on,description FROM experiences WHERE is_visible=true ORDER BY sort_order,started_on DESC"),pool.query<PublicAchievement>("SELECT id,title,achieved_on,description,evidence_url FROM achievements WHERE is_visible=true ORDER BY sort_order,achieved_on DESC")]);
    return {skills:skills.rows,experience:experience.rows,achievements:achievements.rows};
  }catch(error){
    // An unreachable database must degrade to an empty profile, never take the page down:
    // a throw here happens inside a Suspense boundary and strands the visitor on loading.tsx.
    console.error("Profile records unavailable.",error);
    return empty;
  }
}
