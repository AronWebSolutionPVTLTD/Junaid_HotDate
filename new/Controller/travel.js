const travelModel = require("../Model/travel")

module.exports = {
    async createtravel(req, res) {
        try {
            const { name, description, maleAge, femaleAge, location, duration, dates, interested } = req.body
            if (!name, !description, !maleAge, !femaleAge, !location, !duration, !dates, !interested) {
                return res.status(400).send("required the missing data")
            }
            let image = null;
            if (req.file) {
                image = "http://localhost:5000/" + req.file.filename;
            }
            const data = await travelModel.create({ ...req.body, image: image, created_by: req.decode._id })
            if (!data) {
                return res.status(400).send("something went wrong")
            } else {
                return res.status(200).send("travel create successfully")
            }
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    },
    async search_travel(req, res) {
        try {
            const { q } = req.query
            const data = await travelModel.find()
            if (q) {
                const result = await travelModel.find({
                    $or: [
                        { name: { $regex: q, "$options": "i" } },
                        { location: { $regex: q, "$options": "i" } }
                    ]
                })
                return res.status(200).send(result)
            }
            return res.status(200).send(data)
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    },
    async findOne(req, res) {
        try {
            const { id } = req.params
            if (!id) {
                return res.status(400).send("travelId is required")
            }
            const data = await travelModel.findOne({ _id: id })
            if (!data) {
                return res.status(400).send("travel not exist")
            } else {
                return res.status(200).send(data)
            }
        } catch (e) {
            console.log(e)
            return res.status(500).send(e)
        }
    },
    async  update_travel(req, res) {
        try {
          const { travelId } = req.query;
          if (!travelId) {
            return res.status(400).send("travelId is required");
          }
          const exist = await travelModel.findOne({ _id: travelId });
          if (!exist) {
            return res.status(400).send("travelId not exist");
          }
          let image = null;
          if (req.file) {
            image = "http://localhost:5000/" + req.file.filename;
          } else {
            image = exist.image;
          }
          const data = await travelModel.findOneAndUpdate({ _id: exist._id },{...req.body,image:image},{new:true})
          if (!data) {
            return res.status(400).send("something went wrong");
          } else {
            return res.status(200).send("data update successfully");
          }
        } catch (e) {
          console.log(e);
          return res.status(500).send(e);
        }
      }
      ,
    
    async delete_travel(req, res) {
        try {
            const { travelId } = req.params
            if (!travelId) {
                return res.status(400).send("travelId is requires")
            }
            const exist = await travelModel.findOne({ _id: travelId })
            if (!exist) {
                return res.status(400).send("travel not exist")
            }
            const data = await travelModel.findByIdAndDelete({ _id: exist._id })
            if (!data) {
                return res.status(400).send("something wen wrong")
            } else {
                return res.status(200).send("travel delete successfully")
            }
        } catch (e) {
            console.log(e)
            return res.status(400).send(e)
        }
    }
}



