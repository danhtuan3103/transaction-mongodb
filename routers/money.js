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
