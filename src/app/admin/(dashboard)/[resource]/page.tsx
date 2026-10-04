import {notFound} from "next/navigation";
import ResourceManager from "@/components/resource-manager";
import {adminResources} from "@/data/admin-resources";
type Resource=keyof typeof adminResources;
export default async function ResourcePage({params}:PageProps<"/admin/[resource]">){const {resource}=await params;if(!Object.hasOwn(adminResources,resource))notFound();const name=resource as Resource;return <ResourceManager resource={name} title={adminResources[name].title} fields={adminResources[name].fields}/>}
