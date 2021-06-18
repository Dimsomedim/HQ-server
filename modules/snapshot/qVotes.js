const createQueryVotes = (snapId) => {
  return `
        query {
        votes (
            first: 10000
            skip: 0
            where: {
            proposal: "${snapId}"
            }
            orderBy: "created",
            orderDirection: desc
            ) {
                voter
                choice
                created
            }
        }
    `;
};

module.exports = { createQueryVotes };
