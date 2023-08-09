const express = require("express");
const authUser = require("../util/authUser");
const {
  postCreateNewRoom,
  putAddMessage,
  getMessageByRoomId,
  getAllRooms,
} = require("../controllers/chat");
const authAdmin = require("../util/authAdmin");
const authCs = require("../util/authCs");
const router = express.Router();

router.post("/createNewRoom", authUser, postCreateNewRoom);

router.put("/addMessage", authUser, putAddMessage);

router.get("/getById", authUser, getMessageByRoomId);

router.get("/getAllRoom", authCs, getAllRooms);
module.exports = router;
