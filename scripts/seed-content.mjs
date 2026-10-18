import pg from "pg";

try { process.loadEnvFile(".env.local"); } catch { /* Fall back to the ambient environment. */ }
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DATABASE_URL before seeding content.");

/**
 * Publishes the verified portfolio content: technologies, the four real projects, and the
 * DevelopersHub.co internship. Idempotent — re-run it after editing the copy below, or
 * against a new database (a hosted one, for example) to place the same content there.
 *
 * Content is written from the owner's own résumé and repository READMEs. Nothing here is
 * invented: where a project has no measured result, outcome_type stays 'unmeasured'.
 */

const TECHNOLOGIES = [
  { name: "Node.js", slug: "node-js", group: "backend" },
  { name: "Fastify", slug: "fastify", group: "backend" },
  { name: "Socket.IO", slug: "socket-io", group: "backend" },
  { name: "MongoDB", slug: "mongodb", group: "database" },
  { name: "Tailwind CSS", slug: "tailwind-css", group: "frontend" },
  { name: "React Router", slug: "react-router", group: "frontend" },
  { name: "React", slug: "react", group: "frontend" },
  { name: "Redux", slug: "redux", group: "frontend" },
  { name: "Docker", slug: "docker", group: "devops" },
  { name: "Apache Kafka", slug: "apache-kafka", group: "distributed" },
  { name: "Hugging Face", slug: "hugging-face", group: "ai" },
];

const PROJECTS = [
  {
    slug: "real-time-chat",
    title: "Real-Time Chat Application",
    summary: "A real-time chat system built on Socket.IO and Node.js/Fastify, with WebSocket-based bidirectional messaging and MongoDB-backed message history.",
    context: "Built to handle live two-way communication on the backend instead of polling for new messages.",
    role_scope: "Designed and built the application end to end: the server, the messaging layer, the data model, and the containerised environment.",
    approach: "Socket.IO over a Node.js/Fastify server carries messages in both directions, MongoDB stores conversation history, and the service runs from a Docker image so development and deployment behave identically. The server is split into modular layers rather than kept in one file.",
    outcome: "A working real-time messaging service with persistent history that starts anywhere Docker runs.",
    repo: "https://github.com/Arshanashraf/CRUD-SOCKET.IO",
    demo: null,
    technologies: ["Node.js", "Fastify", "Socket.IO", "MongoDB", "Docker"],
    sortOrder: 10,
    featured: true,
  },
  {
    slug: "kafka-crud",
    title: "Kafka-Based CRUD System",
    summary: "A CRUD backend where services communicate through Apache Kafka topics instead of direct calls, giving an event-driven flow with decoupled producers and consumers.",
    context: "Built to work with event-driven communication in practice, using Kafka as the transport between services instead of synchronous HTTP calls.",
    role_scope: "Built the backend services, the Kafka topic flows, and the containerised environment.",
    approach: "CRUD operations publish to Kafka topics that consumers act on, so producers and consumers stay decoupled and processing happens asynchronously. Kafka, Zookeeper, and the application services are each containerised with Docker, and record status is tracked as messages move through the topics.",
    outcome: "A reproducible event-driven backend that comes up with a single Docker Compose command and keeps services scalable independently.",
    repo: "https://github.com/Arshanashraf/Kafka-crud-docker",
    demo: null,
    technologies: ["Node.js", "Apache Kafka", "Docker"],
    sortOrder: 20,
    featured: true,
  },
  {
    slug: "apexbot",
    title: "ApexBot",
    summary: "An AI-powered chatbot that generates its responses through the Hugging Face API, built with React, Vite, Tailwind CSS and Redux.",
    context: "Built to put a language model behind a usable chat interface rather than a one-off prompt.",
    role_scope: "Built the interface, the model API integration, and the deployment.",
    approach: "Conversation state is managed with Redux, responses are generated through the Hugging Face inference API, and the UI is composed from modular components styled with Tailwind CSS. The production build is deployed to Netlify and Hugging Face Spaces.",
    outcome: "A deployed chatbot that anyone can use without needing an account.",
    repo: "https://github.com/Arshanashraf/AI-powered-Apexbot",
    demo: null,
    technologies: ["React", "Redux", "Tailwind CSS", "Hugging Face"],
    sortOrder: 30,
    featured: false,
  },
  {
    slug: "e-commerce",
    title: "E-Commerce Web Application",
    summary: "A responsive e-commerce front end with product filtering, live search, pagination, cart management and a dynamic order summary, built with React, Redux and Tailwind CSS.",
    context: "Built during the front-end internship at DevelopersHub.co as product feature work.",
    role_scope: "Front-end development across catalogue browsing, filtering, the cart, and the ordering flow.",
    approach: "Product filtering and live search run against the catalogue, cart and order state are held in Redux, and React Router handles navigation between the catalogue, filter, cart and order-summary views. Layouts are responsive across mobile, tablet, and desktop.",
    outcome: "A production-deployed storefront front end with a complete browse-to-order-summary flow.",
    repo: "https://github.com/Arshanashraf/Ecommerce-webDesign",
    demo: "https://ecommercewebdesignarshandev.netlify.app/",
    technologies: ["React", "Redux", "Tailwind CSS", "React Router"],
    sortOrder: 40,
    featured: false,
  },
];

const EXPERIENCE = {
  organization: "DevelopersHub.co",
  role: "Frontend Developer Intern",
  startedOn: "2024-11-01",
  endedOn: "2024-12-13",
  description: "Built responsive React.js UI components for customer-facing features, improved application performance and usability across screen sizes, and worked on real feature delivery and deployments. Also built the E-Commerce Web Application during the internship.",
  sortOrder: 10,
};

const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 8_000 });
const client = await pool.connect();
const summary = { technologies: 0, projects: [], experience: "unchanged" };

try {
  await client.query("BEGIN");

  const technologyIds = new Map();
  for (const technology of TECHNOLOGIES) {
    const { rows } = await client.query(
      "INSERT INTO technologies(name,slug,group_name) VALUES($1,$2,$3) ON CONFLICT (name) DO UPDATE SET slug=EXCLUDED.slug,group_name=EXCLUDED.group_name RETURNING id",
      [technology.name, technology.slug, technology.group],
    );
    technologyIds.set(technology.name, rows[0].id);
    summary.technologies += 1;
  }

  for (const project of PROJECTS) {
    const { rows } = await client.query(
      `INSERT INTO projects(title,slug,summary,context,role_scope,approach,decisions,challenges,outcome,outcome_type,status,is_sample,featured,sort_order,repo_url,demo_url,published_at)
       VALUES($1,$2,$3,$4,$5,$6,'','',$7,'unmeasured','published',false,$8,$9,$10,$11,now())
       ON CONFLICT (slug) DO UPDATE SET
         title=EXCLUDED.title, summary=EXCLUDED.summary, context=EXCLUDED.context,
         role_scope=EXCLUDED.role_scope, approach=EXCLUDED.approach, outcome=EXCLUDED.outcome,
         outcome_type=EXCLUDED.outcome_type, status='published', is_sample=false,
         featured=EXCLUDED.featured, sort_order=EXCLUDED.sort_order,
         repo_url=EXCLUDED.repo_url, demo_url=EXCLUDED.demo_url,
         published_at=COALESCE(projects.published_at, now()), updated_at=now()
       RETURNING id`,
      [project.title, project.slug, project.summary, project.context, project.role_scope, project.approach, project.outcome, project.featured, project.sortOrder, project.repo, project.demo],
    );
    const projectId = rows[0].id;

    await client.query("DELETE FROM project_technologies WHERE project_id=$1", [projectId]);
    let position = 0;
    for (const name of project.technologies) {
      const technologyId = technologyIds.get(name);
      if (!technologyId) throw new Error(`Unknown technology "${name}" on ${project.slug}.`);
      await client.query("INSERT INTO project_technologies(project_id,technology_id,sort_order) VALUES($1,$2,$3)", [projectId, technologyId, position]);
      position += 1;
    }
    summary.projects.push(`${project.slug} (published, ${project.technologies.length} technologies)`);
  }

  const updated = await client.query(
    "UPDATE experiences SET role=$1,started_on=$2,ended_on=$3,description=$4,is_visible=true,sort_order=$5,updated_at=now() WHERE organization=$6",
    [EXPERIENCE.role, EXPERIENCE.startedOn, EXPERIENCE.endedOn, EXPERIENCE.description, EXPERIENCE.sortOrder, EXPERIENCE.organization],
  );
  if (updated.rowCount === 0) {
    await client.query(
      "INSERT INTO experiences(organization,role,started_on,ended_on,description,is_visible,sort_order) VALUES($1,$2,$3,$4,$5,true,$6)",
      [EXPERIENCE.organization, EXPERIENCE.role, EXPERIENCE.startedOn, EXPERIENCE.endedOn, EXPERIENCE.description, EXPERIENCE.sortOrder],
    );
    summary.experience = "inserted";
  } else {
    summary.experience = "updated";
  }

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}

console.log("Seeded content:");
console.log(`  technologies: ${summary.technologies}`);
for (const project of summary.projects) console.log(`  project: ${project}`);
console.log(`  experience: DevelopersHub.co (${summary.experience})`);
