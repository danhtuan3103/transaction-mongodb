# Transaction in mongoDB

### Step 1 : Make replication DB model in mongoDb in docker

- Create docker network

  ```shell
      docker network create mongoNet
  ```

- Create 3 db for replicaiton

  ```shell
      docker run -d -p 27018:27017 --net mongoNet --name r0 mongo --replSet mongoRepSet
  ```

  ```shell
      docker run -d -p 27019:27017 --net mongoNet --name r0 mongo --replSet mongoRepSet

  ```

  ```
      docker run -d -p 27010:27017 --net mongoNet --name r0 mongo --replSet mongoRepSet
  ```

- Goto one db to config replication
  `shell
    docker exec -it [name-of-container] bash
`
  Show repli status
  `shell
    rs.status() 
`
  Config replication with private host

  ```shell
  config = {
  "_id": "mongoRepSet",
  "members": [
  { "_id": 0, "host": "192.168.1.101:27018" },
  { "_id": 1, "host": "192.168.1.101:27019" },
  { "_id": 2, "host": "192.168.1.101:27010" }
  ]
  }
  ```

  Initial

  ```shell
    rs.initiate(config)
  ```

  -> Work on the primary db and see the change on the secondary db (insert, update, ....)

### Step 2 :

- Create server connect primary DB

`MONGODB_URL=mongodb://192.168.1.101:27018/test`

```javascript
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected ...."))
  .catch((err) => console.log("MongoDb Error : " + err.message));
```

### Step 3: Work on nodejs with Sesstion

Example with transfer money

```javascript
const express = require("express");
const money = require("../model/moneyBag");
const router = express.Router();

const { startSession } = require("mongoose");
// Create ATM
router.post("/v1/api/user", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const rs = await money.create({
      userId,
      amount,
    });

    res.json({ data: rs });
  } catch (error) {}
});

// Transfer money
router.post("/v1/api/transfer", async (req, res) => {
  const session = await startSession();
  try {
    const { fromId, toId, amount } = req.body;

    session.startTransaction();

    const amountFrom = await money.findOneAndUpdate(
      {
        userId: fromId,
      },
      { $inc: { amount: -amount } },
      { session, new: true }
    );

    if (amountFrom.amount < 0) {
      throw new Error("Amount not enought");
    }

    console.log(`Amount of ${fromId} : ${amountFrom}`);
    const amountTo = await money.findOneAndUpdate(
      {
        userId: toId,
      },
      { $inc: { amount: amount } },
      { session, new: true }
    );

    console.log(`Amount of ${fromId} : ${amountTo}`);

    await session.commitTransaction();
    session.endSession();
    return res.json({
      msg: "Tranfer is Okey",
    });
  } catch (err) {
    console.log("Session Error : " + err);
    await session.abortTransaction();

    res.json({
      msg: "Tranfer is Faild",
    });
  }
});

module.exports = router;
```

## USAGE

> clone this repository
> npm install
> npm run dev
> send request in test.http
