const createQueryBlockTimestamp = (block) => {
  return `
    query{
        blocks(where:{number:${block}}) {
            id
            number
            timestamp
        }
    }`;
};

module.exports = { createQueryBlockTimestamp };
