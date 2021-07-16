const qProposals = `
query {
  proposals (
    first: 200,
    skip: 0,
    where: {
      space_in: ["mstablegovernance.eth"],
      state: "closed"
    },
    orderBy: "created",
    orderDirection: desc
  ) {
    id
    title
    choices
    start
    end
    strategies {
      name
      params
    }
    snapshot
    state
    author
    space {
      id
      name
    }
  }
}`;

module.exports = { qProposals };
