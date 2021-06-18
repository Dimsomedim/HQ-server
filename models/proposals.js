const { getDb } = require("../utils/mongodb");

const getAllProposals = async () => {
  const db = await getDb();
  // if(!db.isConnected()) {throw new Error("DB is not connected")}
  const proposals = db.db("snapvotes").collection("proposals");

  let data;
  try {
    data = await proposals
      .find({})
      .project({ choices: 0, votes: 0, strategies: 0, space: 0 })
      .toArray();
  } catch (err) {
    console.log(err);
  }

  return data;
};

module.exports = { getAllProposals };
