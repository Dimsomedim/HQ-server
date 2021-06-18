require("dotenv").config();

const events = require("events");
const event = new events.EventEmitter();

const MongoClient = require("mongodb").MongoClient;
const { grabAllProposals, grabVoters, grabScores } = require("../snapshot");

const { grabVmtaData } = require("../mstable-governance");

const DB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}`;

const client = new MongoClient(DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  if (err) console.log(err);
});

event.on("done", () => {
  client.close();
});

(async () => {
  let data;
  try {
    data = await grabAllProposals();
  } catch (err) {
    console.log(err);
  }
  const proposals = client.db("snapvotes").collection("proposals");
  // const settings = client.db("snapvotes").collection("settings");

  console.log("Got Proposals count: " + data.proposals.length);

  for (let i = 0; i < data.proposals.length; i++) {
    let res = await proposals.findOne(
      { id: data.proposals[i].id },
      {
        projection: { _id: 0, title: 1, state: 1 },
      }
    );
    if (res) {
      console.log("Skipping " + res.title);
      continue;
    }
    console.log("Adding " + data.proposals[i].title);
    console.log("Grabbing voters!");

    let votes;
    let scores;
    let votersNum;
    let scoreNum = 0;
    let block = parseInt(data.proposals[i].snapshot);
    let votersTotal = 0;
    let scoreTotal = 0;

    try {
      votes = await grabVoters(data.proposals[i].id);
      votes = votes.data.votes;
      // votes [
      //   {
      //     voter: '0xAe6ecA6b0836e37d270722Ba81bB2EcacB674b08',
      //     choice: 4,
      //     created: 1617692724
      //   },
      // ...
      // ]

      console.log("Got voters count: " + votes.length);

      let voters = votes.map((vote) => vote.voter);
      scores = await grabScores(voters, parseInt(data.proposals[i].snapshot));
      // scores [
      //    {
      //      '0xAe6ecA6b0836e37d270722Ba81bB2EcacB674b08': 264.65671771942385,
      //      '0xb9c83f07335B69F7b24b97d2c6E59102E89C2497': 199076.50268145153,
      //      ....
      //    }
      // ]

      votes = votes.map((vote) => {
        console.log(vote.voter + " has voted Score: " + scores[0][vote.voter]);
        // console.log(vote);
        // console.log(scores[0][vote.voter]);
        scoreNum += scores[0][vote.voter];
        return { ...vote, score: scores[0][vote.voter] };
      });

      // Cleaning Zeros
      votes = votes.filter((vote) => vote.score !== 0);

      votersNum = votes.length;
      console.log("Got voters count after cleaning: " + votersNum);
      console.log("Total voted vMTA: " + scoreNum);
    } catch (err) {
      console.log(err);
    }

    let vmtaData = await grabVmtaData(block);

    console.log("Got vmtaData :" + vmtaData.length);

    for (let i = 0; i < vmtaData.length; i++) {
      votersTotal++;
      scoreTotal += vmtaData[i].vmta;
    }

    let result = await proposals.insertOne({
      ...data.proposals[i],
      votes,
      votersNum,
      scoreNum,
      votersTotal,
      scoreTotal,
    });
    // enable later for errors
    // if (!result) throw new Error("Could not post new data into MongoDB");
  }

  event.emit("done");
})();
