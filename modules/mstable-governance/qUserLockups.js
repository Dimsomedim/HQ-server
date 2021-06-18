const createQueryUserLockups = (block) => {
  return `query {
    userLockups(block: {number: ${block}}, where: {lockTime_not: 0}, first: 1000,) {
        account
        lockTime
        value
        ts
        slope
        bias
        ejected
        }
    }`;
};

module.exports = { createQueryUserLockups };
