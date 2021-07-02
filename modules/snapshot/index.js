const fetch = require("node-fetch");
const { qProposals } = require("./qProposals");
const { createQueryVotes } = require("./qVotes");

const snapshot = require("@snapshot-labs/snapshot.js");

const SNAPSHOT_URL = "https://hub.snapshot.page/graphql";

const snapshotFetch = async (query) => {
  let res = await fetch(SNAPSHOT_URL, {
    method: "POST",
    body: JSON.stringify({
      query: query,
      variables: { limit: 1000 },
    }),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  return res;
};

const grabAllProposals = async () => {
  try {
    let res = await snapshotFetch(qProposals);

    if (res.status !== 200)
      return new Error("Status returned is: " + res.status);
    const json = await res.json();
    return json.data;
  } catch (err) {
    return err;
  }
};

const grabVoters = async (snapId) => {
  try {
    let query = createQueryVotes(snapId);
    let res = await snapshotFetch(query);
    if (res.status !== 200)
      throw new Error("Status returned is: " + res.status);
    const json = await res.json();
    return json;
  } catch (err) {
    throw new Error("Could not get Voters! " + err);
  }
};

const grabScores = async (voters, snapshotBlock) => {
  // const voters = ["0xE76Be9C1e10910d6Bc6b63D8031729747910c2f6"];
  // const snapshotBlock = 12495884;

  const space = "mstable";
  const strategies = [
    {
      name: "erc20-balance-of",
      params: {
        address: "0xae8bc96da4f9a9613c323478be181fdb2aa0e1bf",
        symbol: "vMTA",
        decimals: 18,
      },
    },
  ];
  const network = "1";
  const provider = snapshot.utils.getProvider(network);

  try {
    let scores = await snapshot.utils.getScores(
      space,
      strategies,
      network,
      provider,
      voters,
      snapshotBlock
    );
    // console.log("scores");
    return scores;
  } catch (err) {
    return new Error("Couldn't get Scores " + err.message);
  }
};

module.exports = { grabAllProposals, grabVoters, grabScores };
