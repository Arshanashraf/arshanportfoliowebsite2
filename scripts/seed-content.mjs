import pg from "pg";

try { process.loadEnvFile(".env.local"); } catch { /* Fall back to the ambient environment. */ }
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set DATABASE_URL before seeding content.");

/**
 * Places the site's content into whatever database DATABASE_URL points at: technologies,
 * the four published projects, the internship, the owner's skill list, and the settings
 * rows the public site depends on.
 *
 * Written to be run against a *fresh* database (a hosted one, for example) so that a new
 * deployment comes up with the same content as the local one. Safe to re-run:
 *
 *   - Skills and settings are insert-if-missing. They are owner-maintained through the
 *     dashboard, so a re-run never reverts an edit made there. `privacy_retention_days`
 *     is required before the contact form accepts a submission, which is why it is here.
 *   - Projects are keyed by slug and updated in place, so correcting the copy below and
 *     re-running propagates it. If you would rather edit projects only in the dashboard,
 *     do not re-run this after those edits.
 *
 * Project copy comes from the owner's résumé and repository READMEs. Nothing is invented:
 * where a project has no measured result, outcome_type stays 'unmeasured'.
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

const SETTINGS = [
  { key: "theme_default", value: "dark" },
  { key: "privacy_retention_days", value: 365 },
];

// The owner's dashboard-maintained skill list, in the order it was authored.
const SKILLS = [
  ["JavaScript", "Frontend Development", "core", 10, "Modern JavaScript development for interactive web applications, APIs, and frontend systems."],
  ["HTML5", "Frontend Development", "core", 20, ""],
  ["CSS3", "Frontend Development", "core", 30, ""],
  ["React.js", "Frontend Development", "core", 40, "Building component-based, responsive web applications with modern React patterns."],
  ["Redux", "Frontend Development", "core", 50, ""],
  ["Tailwind CSS", "Frontend Development", "core", 60, ""],
  ["Bootstrap", "Frontend Development", "core", 70, ""],
  ["Node.js", "Backend Development", "core", 80, "Building backend services, REST APIs, real-time applications, and server-side systems."],
  ["Express.js", "Backend Development", "core", 90, ""],
  ["Fastify", "Backend Development", "working_knowledge", 100, ""],
  ["REST APIs", "Backend Development", "core", 110, "Designing and consuming RESTful APIs for full-stack applications."],
  ["MongoDB", "Databases", "core", 120, ""],
  ["MySQL", "Databases", "working_knowledge", 130, ""],
  ["WebSockets", "Real-Time & Distributed Systems", "working_knowledge", 140, "Building real-time bidirectional communication between clients and servers."],
  ["Socket.IO", "Real-Time & Distributed Systems", "working_knowledge", 150, ""],
  ["Apache Kafka", "Real-Time & Distributed Systems", "working_knowledge", 160, "Working with event-driven architectures, producers/consumers, and Kafka-based backend applications."],
  ["RabbitMQ", "Real-Time & Distributed Systems", "working_knowledge", 170, "Working with message queues and asynchronous backend communication."],
  ["Git", "Development & Tools", "core", 180, ""],
  ["GitHub", "Development & Tools", "core", 190, ""],
  ["Docker", "Development & Tools", "working_knowledge", 200, "Containerizing development environments and backend services."],
  ["Postman", "Development & Tools", "core", 210, ""],
  ["VS Code", "Development & Tools", "core", 220, ""],
  ["Chrome DevTools", "Development & Tools", "core", 230, ""],
  ["C++", "Programming", "working_knowledge", 240, ""],
  ["AI Integration", "AI & Modern Development", "working_knowledge", 250, "Integrating AI/LLM capabilities into modern web applications."],
  ["LLM APIs", "AI & Modern Development", "working_knowledge", 260, ""],
  ["RAG (Retrieval-Augmented Generation)", "AI & Modern Development", "currently_learning", 270, "Learning retrieval-augmented generation systems involving document ingestion, embeddings, vector search, and grounded responses."],
  ["AI Agents", "AI & Modern Development", "currently_learning", 280, ""],
  ["LangGraph", "AI & Modern Development", "currently_learning", 290, ""],
  ["LlamaIndex", "AI & Modern Development", "currently_learning", 300, ""],
  ["Ollama", "AI & Modern Development", "currently_learning", 310, ""],
  ["Next.js", "Full-Stack Development", "currently_learning", 320, "Currently expanding from React development into full-stack Next.js applications."],
  ["TypeScript", "Full-Stack Development", "currently_learning", 330, "Currently learning TypeScript to improve type safety and maintainability in larger applications."],
  ["Mobile App Development", "App Development", "currently_learning", 340, "Currently expanding web development experience toward mobile application development."],
  ["Event-Driven Architecture", "Architecture", "working_knowledge", 350, ""],
  ["Appwrite", "Backend Development", "working_knowledge", 360, ""],
  ["Hugging Face", "AI & Modern Development", "working_knowledge", 370, ""],
];

const PROJECTS = [
  {
    slug: "real-time-chat",
    title: "Real-Time Chat Application",
    summary: "A real-time chat system built on Socket.IO and Node.js/Fastify, with WebSocket-based bidirectional messaging and MongoDB-backed message history.",
    context: "Built to handle live two-way communication on the backend instead of polling for new messages.",
    role: "Designed and built the application end to end: the server, the messaging layer, the data model, and the containerised environment.",
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
    role: "Built the backend services, the Kafka topic flows, and the containerised environment.",
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
    role: "Built the interface, the model API integration, and the deployment.",
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
    role: "Front-end development across catalogue browsing, filtering, the cart, and the ordering flow.",
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
const summary = { technologies: 0, skillsAdded: 0, skillsPresent: 0, settings: [], projects: [], experience: "unchanged" };

try {
  await client.query("BEGIN");

  for (const setting of SETTINGS) {
    const { rowCount } = await client.query("INSERT INTO portfolio_settings(key,value) VALUES($1,$2::jsonb) ON CONFLICT (key) DO NOTHING", [setting.key, JSON.stringify(setting.value)]);
    summary.settings.push(`${setting.key}${rowCount ? " (added)" : " (present)"}`);
  }

  for (const [name, group, confidence, sortOrder, description] of SKILLS) {
    const { rowCount } = await client.query(
      "INSERT INTO skills(name,group_name,confidence,description,is_visible,sort_order) VALUES($1,$2,$3,$4,true,$5) ON CONFLICT (name) DO NOTHING",
      [name, group, confidence, description, sortOrder],
    );
    if (rowCount) summary.skillsAdded += 1; else summary.skillsPresent += 1;
  }

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
      [project.title, project.slug, project.summary, project.context, project.role, project.approach, project.outcome, project.featured, project.sortOrder, project.repo, project.demo],
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
console.log(`  settings: ${summary.settings.join(", ")}`);
console.log(`  skills: ${summary.skillsAdded} added, ${summary.skillsPresent} already present (${SKILLS.length} total)`);
console.log(`  technologies: ${summary.technologies}`);
for (const project of summary.projects) console.log(`  project: ${project}`);
console.log(`  experience: DevelopersHub.co (${summary.experience})`);
