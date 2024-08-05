const Product = require("../models/ProductModel");
const User = require("../models/UserModel");
const mongoose = require('mongoose');
const path = require("path");
const {v4: uuidv4} = require('uuid');
const FILE_STORAGE_PATH = process.env.FILE_STORAGE_PATH

const get = async (req, res, next) => {
    res.render('projects');
}

const getAll = async (req, res, next) => {
    var uemail = req.session.useremail;
    var products = await Product.find({userId: uemail})
    console.log(products)
    res.json(products)
}

const create = async (req, res) => {

    var name = req.body.name
    var description = req.body.description
    if (!name) {
        res.status(400).send('No name was provided.');
        return;
    }
    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(400).send('No files were uploaded.');
        return;
    }

    var file = req.files.file
    var uuid = uuidv4();
    var filename = uuid + path.extname(file.name)
    var uploadPath = FILE_STORAGE_PATH + "/" + filename
    file.mv(uploadPath, function (err) {
        if (err) {
            return res.status(500).send(err);
        }
        var formdata = {
            userId: req.session.userid,
            name: name,
            description: description,
            filename: filename
        };

        Product.create(formdata, function (err, res) {
            if (err) {
                console.log(err, res);
                return res.status(500).send(err);
            }
        });
        return res.redirect('/');
    });
}

const getOneById = async (req, res, next) => {
    var id = mongoose.Types.ObjectId(req.params['id']);
    var product = await Product.findById(id)
    console.log(product)
    res.render('product-view', {product: product});
}

//TODO add user verif
const getImage = async (req, res, next) => {
    var id = mongoose.Types.ObjectId(req.params['id']);
    var product = await Product.findById(id)
    var filePath = FILE_STORAGE_PATH + "/" + product.filename
    if (req.session.userid === product.userId)
        return res.sendFile(filePath);
    else {
        return res.sendStatus(500);
    }
}

module.exports = {get, getAll, create, getOneById, getImage}
