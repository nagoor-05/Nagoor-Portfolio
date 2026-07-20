import { connectDatabase } from "../config/db.js";
import { User } from "../models/User.js";
import { PortfolioItem } from "../models/PortfolioItem.js";
import { projects } from "../../../frontend/src/data/projectShowcase.js";

async function updateSymbolTableProject() {
  await connectDatabase();

  const username = (process.env.ADMIN_USERNAME || "nagoor").toLowerCase();
  const user = await User.findOne({ username });

  if (!user) {
    throw new Error(`User ${username} not found. Run npm run seed first.`);
  }

  const projectIds = ["symbol-table-analyzer", "ai-timetable-generation"];

  for (const id of projectIds) {
    const project = projects.find((item) => item.id === id);

    if (!project) {
      throw new Error(`Project content not found: ${id}`);
    }

    const { title, ...data } = project;

    await PortfolioItem.findOneAndUpdate(
      { ownerId: user._id, type: "project", slug: id },
      {
        title,
        data: {
          ...data,
          slug: id,
        },
        order: projects.findIndex((item) => item.id === id),
        isVisible: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log("Updated detailed project content for:", projectIds.join(", "));
  process.exit(0);
}

updateSymbolTableProject().catch((error) => {
  console.error(error);
  process.exit(1);
});
