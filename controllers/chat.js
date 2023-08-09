const Session = require("../models/Session");
const { getIO } = require("../util/socket");

exports.postCreateNewRoom = async (req, res, next) => {
  console.log("postCreateNewRoom");
  const newSession = new Session({
    user: req.user._id,
    chat: [],
  });
  console.log(newSession);
  try {
    await newSession.save();
    const io = getIO();
    io.emit("new_room_created");
    res.status(201).json(newSession);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};

exports.putAddMessage = async (req, res, next) => {
  console.log("putAddMessage");
  console.log(req.body);
  const io = getIO();
  try {
    if (req.body.message === "==END ROOM==") {
      await Session.findByIdAndDelete(req.body.roomId);

      io.emit("end_room");
      res.status(200).json({ message: "Room deleted!" });
    } else {
      const foundRoom = await Session.findById(req.body.roomId);
      foundRoom.chat.push({
        message: req.body.message,
        roomId: req.body.roomId,
        is_admin: req.body.is_admin,
      });
      await foundRoom.save();

      io.emit("receive_message");
      res.status(200).json({ message: "Message added!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

exports.getMessageByRoomId = async (req, res, next) => {
  console.log("getMessageByRoomId");
  const roomId = req.query.roomId;
  try {
    const foundRoom = await Session.findById(roomId);

    // response if room not found
    if (!foundRoom) {
      return res.status(404).json({ message: "Room not found!" });
    }

    // prevent other user (not admin and cs) from getting room data
    if (
      req.user._id.toString() !== foundRoom.user.toString() &&
      req.user.role === "user"
    ) {
      return res.status(403).json({ message: "Not authorized!" });
    }
    res.status(200).json(foundRoom);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};

exports.getAllRooms = async (req, res, next) => {
  try {
    const allRooms = await Session.find({}).populate("user");
    console.log(allRooms);
    res.status(200).json(allRooms);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong!" });
  }
};
