const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const uploadFile = require("./services/storage.service")
const postModel = require("./models/post.model")

const app = express();
app.use(express.json());

const uplode = multer({storage: multer.memoryStorage()})



app.post('/create-post',uplode.single("image"), async (req, res) =>{

    const result = await uploadFile(req.file.buffer)

    const post = await postModel.create({
        Image: result.url,
        caption: req.body.caption
    })

    return res.status(201).json({
        message: "psot created successfully",
        post
    })

})

app.get("/posts", async (req, res) => {

    const posts = await postModel.find()

    return res.status(200).json({
        message: "posts fetched successfully",
        posts
    })

})

app.delete("/posts/:id", async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "invalid post id",
        });
    }

    const deletedPost = await postModel.findByIdAndDelete(id);

    if (!deletedPost) {
        return res.status(404).json({
            message: "post not found",
        });
    }

    return res.status(200).json({
        message: "post deleted successfully",
        deletedPost,
    });
})

app.patch("/posts/:id", async (req, res) => {
    const { id } = req.params;
    const { caption } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            message: "invalid post id",
        });
    }

    if (!caption || !caption.trim()) {
        return res.status(400).json({
            message: "caption is required",
        });
    }

    const updatedPost = await postModel.findByIdAndUpdate(
        id,
        { caption: caption.trim() },
        { new: true }
    );

    if (!updatedPost) {
        return res.status(404).json({
            message: "post not found",
        });
    }

    return res.status(200).json({
        message: "post updated successfully",
        post: updatedPost,
    });
})

module.exports = app;
