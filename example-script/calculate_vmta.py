import argparse
import requests

SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/mstable/mstable-governance"

# Example usage:
# python calculate_vmta.py 12280000 12281000 12282000 12283000

def get_block_timestamp(blk_num):
    "Get the timestamp corresponding to a block number"
    query = """
{
  blocks(where:{number:%d}) {
    id
    number
    timestamp
  }
}
""" % (
        blk_num
    )

    try:
        response = requests.post(
            "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks",
            json={"query": query},
        )
        timestamp = int(response.json()["data"]["blocks"][0]["timestamp"])
    except:
        raise Exception(
            "There was a problem for getting the timestamp for block %d"
            % (blk_num)
        )

    return timestamp


def get_query(blk_num, page, page_size=500):
    return """
{
  userLockups(block: {number: %d}, where: {lockTime_not: 0}, first: %d, skip: %d) {
    account
    lockTime
    value
    ts
    slope
    bias
    ejected
  }
}"""%(blk_num, page_size, page_size * page)

def get_lockups(blk_num):
    page = 0
    user_lockups = []
    while True:
        query = get_query(blk_num, page)
        response = requests.post(SUBGRAPH_URL, json={"query": query})
        data = response.json()["data"]["userLockups"]

        if len(data) == 0:
            break

        user_lockups.extend(data)
        page += 1

    return user_lockups

def get_vmta(blk_num):
    user_lockups = get_lockups(blk_num)
    timestamp = get_block_timestamp(blk_num)

    vmta_dict = {}

    for lockup in user_lockups:
        bias = int(lockup["bias"])
        slope = int(lockup["slope"])
        staking_ts = int(lockup["ts"])
        vmta = (bias - (timestamp - staking_ts) * slope)

        if vmta >= 0:
            vmta_dict[lockup["account"]] = vmta * 1e-18

    return vmta_dict

    # sort = sorted(list(vmta_dict.items()), key=lambda x: x[1], reverse=True)
    # print("Number of stakers:", len(sort))

    # for i in range(10):
    #     print(sort[i])

parser = argparse.ArgumentParser()
parser.add_argument("blocks", nargs="+", type=int, help="Block numbers")


if __name__ == "__main__":
    args = parser.parse_args()

    print("blk_num, n_stakers, total_vmta")

    for blk_num in args.blocks:
        vmta_dict = get_vmta(blk_num)
        n_stakers = len(vmta_dict)
        total_vmta = sum(list(vmta_dict.values()))
        print("%d, %d, %.2f"%(blk_num, n_stakers, total_vmta))
