const fetch = require("node-fetch");

const { createQueryUserLockups } = require("./qUserLockups");
const { createQueryBlockTimestamp } = require("./qBlockTimestamp");

const GRAPHQL_URL =
  "https://api.thegraph.com/subgraphs/name/mstable/mstable-governance";

const TIMESTAMP_URL =
  "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks";

const grabTimestamp = async (block) => {
  let res = await fetch(TIMESTAMP_URL, {
    method: "POST",
    body: JSON.stringify({
      query: createQueryBlockTimestamp(block),
      variables: { limit: 1000 },
    }),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  if (res.status !== 200) return new Error("Status returned is: " + res.status);
  const json = await res.json();
  return json.data.blocks[0].timestamp;
};

const grabVmtaData = async (block) => {
  let timestamp = await grabTimestamp(block);
  let res = await fetch(GRAPHQL_URL, {
    method: "POST",
    body: JSON.stringify({
      query: createQueryUserLockups(block),
      variables: { limit: 1000 },
    }),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (res.status !== 200) return new Error("Status returned is: " + res.status);
  const json = await res.json();

  //   console.log(json);

  let vmtaData = json.data.userLockups.map((lockup) => {
    timestamp = parseInt(timestamp);
    let bias = parseInt(lockup.bias),
      staking_ts = parseInt(lockup.ts),
      slope = parseInt(lockup.slope);
    let vmta = (bias - (timestamp - staking_ts) * slope) * 1e-18;

    return { account: lockup.account, vmta };
  });

  return vmtaData;
};

module.exports = { grabVmtaData };
